'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, type Product } from '@/lib/supabase';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [searchVal, setSearchVal] = useState(q);

  useEffect(() => {
    setSearchVal(q);
  }, [q]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!q.trim()) {
        const { data: feat } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(8);
        setFeatured(feat || []);
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${q}%`)
        .order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="h-12 pl-10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchVal.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(searchVal.trim())}`;
            }
          }}
        />
      </div>

      {q.trim() ? (
        <>
          <h1 className="mb-2 text-xl font-bold">
            Kết quả tìm kiếm cho: &ldquo;{q}&rdquo;
          </h1>
          <p className="mb-4 text-sm text-muted-foreground">
            Tìm thấy {products.length} sản phẩm
          </p>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm text-muted-foreground">Thử từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h1 className="mb-4 text-xl font-bold">Sản phẩm nổi bật</h1>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
