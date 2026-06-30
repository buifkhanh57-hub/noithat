'use client';

import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Product, type Category } from '@/lib/supabase';
import { ProductCard, ProductCardSkeleton } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { SlidersHorizontal, X } from 'lucide-react';

const COLORS = ['Đen', 'Trắng', 'Nâu', 'Xám', 'Be', 'Gỗ tự nhiên', 'Xanh navy', 'Vàng đồng', 'Trong suốt'];
const MATERIALS = ['Vải nỉ', 'Da thật', 'Da PU', 'Gỗ sồi', 'Gỗ thông', 'Gỗ MDF', 'Kim loại', 'Vải linen', 'Đá + kim loại', 'Lưới + nhựa', 'Pha lê + kim loại', 'Gỗ + kim loại', 'Gỗ + vải', 'Kim loại + gỗ', 'Kim loại + vải'];

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [promoOnly, setPromoOnly] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let cat: Category | null = null;
      if (slug !== 'all') {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        cat = catData;
        setCategory(catData);
      } else {
        setCategory(null);
      }

      let query = supabase.from('products').select('*');
      if (slug !== 'all' && cat) {
        query = query.eq('category_id', cat.id);
      }
      const { data } = await query.order('created_at', { ascending: false });
      setProducts(data || []);
      setLoading(false);
    })();
  }, [slug]);

  const toggleColor = (c: string) => {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleMaterial = (m: string) => {
    setSelectedMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const filtered = products.filter((p) => {
    const price = p.discount_price && p.discount_price < p.price ? p.discount_price : p.price;
    if (price < priceRange[0] || price > priceRange[1]) return false;
    if (selectedColors.length > 0 && !selectedColors.includes(p.color || '')) return false;
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material || '')) return false;
    if (minRating > 0 && p.rating < minRating) return false;
    if (promoOnly && !p.is_promo) return false;
    return true;
  });

  const clearFilters = () => {
    setPriceRange([0, 20000000]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setMinRating(0);
    setPromoOnly(false);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bộ lọc</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>Xóa tất cả</Button>
      </div>

      {/* Price */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Khoảng giá</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            min={0}
            max={20000000}
            step={500000}
            className="my-2"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Color */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Màu sắc</Label>
        <div className="space-y-2">
          {COLORS.map((c) => (
            <div key={c} className="flex items-center gap-2">
              <Checkbox checked={selectedColors.includes(c)} onCheckedChange={() => toggleColor(c)} />
              <span className="text-sm">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Material */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Chất liệu</Label>
        <div className="space-y-2">
          {MATERIALS.map((m) => (
            <div key={m} className="flex items-center gap-2">
              <Checkbox checked={selectedMaterials.includes(m)} onCheckedChange={() => toggleMaterial(m)} />
              <span className="text-sm">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <Label className="mb-2 block text-sm font-medium">Đánh giá tối thiểu</Label>
        <div className="space-y-2">
          {[0, 3, 4, 4.5].map((r) => (
            <div key={r} className="flex items-center gap-2">
              <Checkbox
                checked={minRating === r}
                onCheckedChange={() => setMinRating(r)}
              />
              <span className="text-sm">
                {r === 0 ? 'Tất cả' : `${r}★ trở lên`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo */}
      <div>
        <div className="flex items-center gap-2">
          <Checkbox checked={promoOnly} onCheckedChange={(v) => setPromoOnly(!!v)} />
          <span className="text-sm font-medium">Chỉ sản phẩm khuyến mãi</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">
        {slug === 'all' ? 'Tất cả sản phẩm' : category?.name || 'Danh mục'}
      </h1>

      <div className="flex gap-6">
        {/* Filters - desktop */}
        <aside className="hidden w-64 flex-shrink-0 md:block">
          <div className="sticky top-24 rounded-lg border p-4">
            <FilterPanel />
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Mobile filter toggle */}
          <div className="mb-4 md:hidden">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
            {showFilters && (
              <div className="mt-3 rounded-lg border p-4">
                <FilterPanel />
              </div>
            )}
          </div>

          <p className="mb-3 text-sm text-muted-foreground">
            Hiển thị {filtered.length} sản phẩm
          </p>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg font-medium text-muted-foreground">Không tìm thấy sản phẩm</p>
              <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">Xóa bộ lọc</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
