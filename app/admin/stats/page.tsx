'use client';

import { useEffect, useState } from 'react';
import { supabase, formatPrice } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [revenueByMonth, setRevenueByMonth] = useState<{ name: string; revenue: number; orders: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase.from('orders').select('id, total, status, created_at');
      const { data: items } = await supabase.from('order_items').select('product_name, price, quantity');

      // Revenue by month
      const now = new Date();
      const months: { name: string; revenue: number; orders: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
        const monthOrders = (orders || []).filter((o) => {
          const od = new Date(o.created_at);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        });
        months.push({
          name: monthName,
          revenue: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
          orders: monthOrders.length,
        });
      }
      setRevenueByMonth(months);

      // Top products
      const prodMap = (items || []).reduce((acc, item) => {
        const key = item.product_name || 'Unknown';
        if (!acc[key]) acc[key] = { name: key, quantity: 0, revenue: 0 };
        acc[key].quantity += item.quantity;
        acc[key].revenue += item.price * item.quantity;
        return acc;
      }, {} as Record<string, { name: string; quantity: number; revenue: number }>);
      setTopProducts(Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

      // Status breakdown
      const statusMap: Record<string, string> = {
        pending: 'Chờ xử lý', processing: 'Đang xử lý', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy',
      };
      const statusCounts = (orders || []).reduce((acc, o) => {
        const label = statusMap[o.status] || o.status;
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setStatusBreakdown(Object.entries(statusCounts).map(([name, count]) => ({ name, count })));

      setLoading(false);
    })();
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Thống kê doanh thu</h1>

      <div className="mb-6 rounded-lg border bg-white p-4">
        <h2 className="mb-4 font-semibold">Doanh thu & đơn hàng 12 tháng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(v, name) => name === 'revenue' ? formatPrice(v as number) : v} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6A00" name="Doanh thu" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#0088FE" name="Đơn hàng" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 font-semibold">Top 5 sản phẩm bán chạy</h2>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(v) => formatPrice(v as number)} />
                <Bar dataKey="revenue" fill="#FF6A00" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-16 text-center text-muted-foreground">Chưa có dữ liệu</p>}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 font-semibold">Trạng thái đơn hàng</h2>
          {statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-16 text-center text-muted-foreground">Chưa có dữ liệu</p>}
        </div>
      </div>
    </div>
  );
}
