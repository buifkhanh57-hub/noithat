'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { formatPrice, getEffectivePrice, getDiscountPercent, type Product } from '@/lib/supabase';
import { toast } from 'sonner';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const discount = getDiscountPercent(product);
  const price = getEffectivePrice(product);

  const handleAddCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }
    await addItem(product, 1);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/appointment');
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Eye className="h-8 w-8" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute left-2 top-2 brand-bg text-white">-{discount}%</Badge>
          )}
          {product.is_featured && discount === 0 && (
            <Badge className="absolute left-2 top-2 bg-black text-white">Nổi bật</Badge>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-foreground">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">{formatPrice(price)}</span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-amber-500">★</span>
            <span>{product.rating > 0 ? product.rating.toFixed(1) : 'Chưa có đánh giá'}</span>
            {product.stock > 0 ? (
              <span className="ml-1 text-green-600">· Còn hàng</span>
            ) : (
              <span className="ml-1 text-red-500">· Hết hàng</span>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleAddCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-1 h-3.5 w-3.5" />
              Giỏ
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleBook}
            >
              <Calendar className="mr-1 h-3.5 w-3.5" />
              Lịch
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="aspect-square skeleton-shimmer" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-full skeleton-shimmer rounded" />
        <div className="h-4 w-2/3 skeleton-shimmer rounded" />
        <div className="h-5 w-1/2 skeleton-shimmer rounded" />
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="h-8 skeleton-shimmer rounded" />
          <div className="h-8 skeleton-shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
