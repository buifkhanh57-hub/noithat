'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, formatPrice, getEffectivePrice, type Voucher } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, removeItem, updateQuantity, clearCart } = useCart();
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');

  const subtotal = items.reduce((sum, i) => {
    if (!i.product) return sum;
    return sum + getEffectivePrice(i.product) * i.quantity;
  }, 0);

  const discount = appliedVoucher
    ? Math.min(
        Math.round((subtotal * appliedVoucher.discount_percent) / 100),
        appliedVoucher.max_discount || Infinity
      )
    : 0;
  const total = Math.max(0, subtotal - discount);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setCheckingVoucher(true);
    const { data } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucherCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();
    if (!data) {
      toast.error('Mã giảm giá không hợp lệ');
      setAppliedVoucher(null);
      setCheckingVoucher(false);
      return;
    }
    if (data.min_order && subtotal < data.min_order) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(data.min_order)}`);
      setAppliedVoucher(null);
      setCheckingVoucher(false);
      return;
    }
    setAppliedVoucher(data);
    toast.success(`Áp dụng mã giảm giá ${data.discount_percent}%`);
    setCheckingVoucher(false);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    if (!shippingAddress.trim() || !phone.trim()) {
      toast.error('Vui lòng nhập địa chỉ và số điện thoại');
      return;
    }
    setCheckingOut(true);
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total,
        shipping_address: shippingAddress.trim(),
        phone: phone.trim(),
        voucher_code: appliedVoucher?.code || null,
      })
      .select('*')
      .single();
    if (error || !order) {
      toast.error('Đặt hàng thất bại');
      setCheckingOut(false);
      return;
    }
    const orderItems = items
      .filter((i) => i.product)
      .map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product!.name,
        price: getEffectivePrice(i.product!),
        quantity: i.quantity,
      }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      toast.error('Đặt hàng thất bại');
      setCheckingOut(false);
      return;
    }
    await clearCart();
    toast.success('Đặt hàng thành công!');
    setCheckingOut(false);
    router.push('/account/orders');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-bold">Vui lòng đăng nhập để xem giỏ hàng</h1>
        <Link href="/login" className="mt-4 inline-block">
          <Button>Đăng nhập</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-bold">Giỏ hàng trống</h1>
        <p className="mt-2 text-muted-foreground">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border p-3">
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-20 w-20 flex-shrink-0 rounded object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col">
                  <Link href={`/product/${item.product?.slug}`} className="font-medium hover:underline">
                    {item.product?.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(getEffectivePrice(item.product!))}
                  </span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border rounded">
                      <button
                        className="px-2 py-1 hover:bg-muted disabled:opacity-50"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        className="px-2 py-1 hover:bg-muted"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-right font-bold">
                  {formatPrice(getEffectivePrice(item.product!) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-lg border p-4">
            <h2 className="mb-4 font-semibold">Tóm tắt đơn hàng</h2>

            {/* Voucher */}
            <div className="mb-4">
              <Label className="mb-2 block text-sm">Mã giảm giá</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập mã..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  disabled={!!appliedVoucher}
                />
                {appliedVoucher ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                    }}
                  >
                    Hủy
                  </Button>
                ) : (
                  <Button onClick={applyVoucher} disabled={checkingVoucher} size="sm">
                    <Tag className="mr-1 h-3.5 w-3.5" />
                    Áp dụng
                  </Button>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-y py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between py-4 text-lg font-bold">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>

            {/* Checkout form */}
            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-sm">Số điện thoại *</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0xxx xxx xxx"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Địa chỉ giao hàng *</Label>
                <Textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, quận, thành phố"
                  rows={2}
                />
              </div>
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full brand-bg text-white hover:opacity-90"
              >
                {checkingOut ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
