'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Calendar, Star, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { supabase, formatPrice, getEffectivePrice, getDiscountPercent, type Product, type Review } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductCard } from '@/components/product-card';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!prod) {
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(prod);

      const [relRes, revRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('category_id', prod.category_id)
          .neq('id', prod.id)
          .limit(4),
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', prod.id)
          .order('created_at', { ascending: false }),
      ]);
      setRelated(relRes.data || []);
      setReviews(revRes.data || []);
      setLoading(false);
    })();
  }, [slug]);

  const handleAddCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      router.push('/login');
      return;
    }
    if (!product) return;
    await addItem(product, quantity);
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      router.push('/login');
      return;
    }
    if (!product) return;
    await addItem(product, quantity);
    router.push('/cart');
  };

  const handleBook = () => {
    router.push('/appointment');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      router.push('/login');
      return;
    }
    if (!product) return;
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: product.id,
        user_id: user.id,
        user_name: reviewName.trim() || user.email,
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      .select('*')
      .single();
    if (error) {
      toast.error('Gửi đánh giá thất bại');
      setSubmitting(false);
      return;
    }
    setReviews((prev) => [data, ...prev]);
    setReviewComment('');
    setReviewName('');
    setReviewRating(5);
    toast.success('Đã gửi đánh giá');
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-muted-foreground">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Về trang chủ</Button>
        </Link>
      </div>
    );
  }

  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const images = product.images?.length ? product.images : ['/placeholder.svg'];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-zoom-in"
            onClick={() => setZoom(!zoom)}
          >
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover transition-transform duration-300 ${zoom ? 'scale-150' : 'scale-100'}`}
            />
            <div className="absolute right-2 top-2 rounded bg-black/50 p-1.5 text-white">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 ${
                    activeImage === i ? 'border-brand' : 'border-transparent'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {product.video_url && (
            <div className="mt-3">
              <video src={product.video_url} controls className="w-full rounded-lg" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-muted-foreground">
                {product.rating > 0 ? `${product.rating} (${reviews.length} đánh giá)` : 'Chưa có đánh giá'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                <Badge className="brand-bg text-white">-{discount}%</Badge>
              </>
            )}
          </div>

          {/* Specs */}
          <div className="mt-6 space-y-2 border-y py-4">
            {product.color && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Màu sắc</span>
                <span className="font-medium">{product.color}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Chất liệu</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.size && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kích thước</span>
                <span className="font-medium">{product.size}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tình trạng</span>
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-4 flex items-center gap-3">
            <Label className="text-sm">Số lượng</Label>
            <div className="flex items-center border rounded">
              <button
                className="px-3 py-1.5 text-lg hover:bg-muted disabled:opacity-50"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 border-0 text-center"
                min={1}
                max={product.stock}
              />
              <button
                className="px-3 py-1.5 text-lg hover:bg-muted disabled:opacity-50"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button onClick={handleAddCart} disabled={product.stock === 0} variant="outline" className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm giỏ
            </Button>
            <Button onClick={handleBuyNow} disabled={product.stock === 0} className="w-full brand-bg text-white hover:opacity-90">
              Mua ngay
            </Button>
            <Button onClick={handleBook} variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Đặt lịch
            </Button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Mô tả sản phẩm</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Đánh giá ({reviews.length})</h2>

        {/* Review form */}
        <form onSubmit={handleSubmitReview} className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">Viết đánh giá</h3>
          <div className="mb-3 flex items-center gap-2">
            <Label className="text-sm">Đánh giá:</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReviewRating(i + 1)}
                >
                  <Star
                    className={`h-5 w-5 ${
                      i < reviewRating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Input
            placeholder="Tên hiển thị (tùy chọn)"
            value={reviewName}
            onChange={(e) => setReviewName(e.target.value)}
            className="mb-3"
          />
          <Textarea
            placeholder="Nội dung đánh giá..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </form>

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user_name || 'Ẩn danh'}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
