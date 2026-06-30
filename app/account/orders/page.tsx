'use client';

import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Order, type OrderItem } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!orderData || orderData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const orderIds = orderData.map((o) => o.id);
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      const itemsByOrder = (items || []).reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {} as Record<string, OrderItem[]>);
      setOrders(orderData.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] })));
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Bạn chưa có đơn hàng nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const cfg = STATUS_MAP[order.status] || STATUS_MAP.pending;
        return (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Đơn hàng #{order.id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <Badge className={cfg.color}>{cfg.label}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 font-bold">
              <span>Tổng cộng</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            {order.shipping_address && (
              <p className="mt-2 text-xs text-muted-foreground">
                Giao đến: {order.shipping_address}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
