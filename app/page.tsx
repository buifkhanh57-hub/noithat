'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, type Product, type Category, type Banner } from '@/lib/supabase';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 12;

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [featured, setFeatured] = useState<Product[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: bannerData }, { data: catData }, { data: featData }] = await Promise.all([
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').eq('is_featured', true).limit(4),
      ]);
      setBanners(bannerData || []);
      setCategories(catData || []);
      setFeatured(featData || []);

      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);
      setProducts(prodData || []);
      setHasMore((prodData || []).length === PAGE_SIZE);
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextOffset = products.length;
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(nextOffset, nextOffset + PAGE_SIZE - 1);
    const newProducts = data || [];
    setProducts((prev) => [...prev, ...newProducts]);
    setHasMore(newProducts.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, hasMore, products.length]);

  useEffect(() => {
    if (loading) return;
    const el = loadMoreRef.current;
    if (!el) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );
    observerRef.current.observe(el);
    return () => observerRef.current?.disconnect();
  }, [loadMore, loading]);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Banner - max 250px */}
      {loading ? (
        <Skeleton className="mb-6 h-[250px] w-full rounded-lg" />
      ) : banners.length > 0 ? (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {banners.slice(0, 2).map((b) => (
            <Link
              key={b.id}
              href={b.link_url || '#'}
              className="relative block h-[250px] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                src={b.image_url}
                alt={b.title || 'Banner'}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {b.title && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h2 className="text-xl font-bold text-white md:text-2xl">{b.title}</h2>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Danh mục nổi bật</h2>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold">
                  {cat.name.charAt(0)}
                </div>
                <span className="text-center text-xs font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured products */}
      {!loading && featured.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Sản phẩm nổi bật</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* All products */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Tất cả sản phẩm</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium text-muted-foreground">Chưa có sản phẩm nào</p>
            <p className="text-sm text-muted-foreground">Vui lòng quay lại sau</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
              {loadingMore &&
                Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={`more-${i}`} />)}
            </div>
            <div ref={loadMoreRef} className="h-10" />
            {!hasMore && products.length > 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Đã hiển thị tất cả sản phẩm
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
