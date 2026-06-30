'use client';

import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Order, type OrderItem } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý', processing: 'Đang xử lý', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { items?: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!orderData || orderData.length === 0) { setOrders([]); setLoading(false); return; }
    const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderData.map((o) => o.id));
    const itemsByOrder = (items || []).reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {} as Record<string, OrderItem[]>);
    setOrders(orderData.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] })));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) toast.error('Cập nhật thất bại');
    else { toast.success('Đã cập nhật trạng thái'); await fetchData(); }
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  if (orders.length === 0) return <p className="py-8 text-center text-muted-foreground">Chưa có đơn hàng</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý đơn hàng</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div>
                <p className="font-medium">Đơn #{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 font-bold">
              <span>Tổng cộng</span><span>{formatPrice(order.total)}</span>
            </div>
            {order.shipping_address && <p className="mt-1 text-xs text-muted-foreground">Giao đến: {order.shipping_address}</p>}
            {order.phone && <p className="text-xs text-muted-foreground">SĐT: {order.phone}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
