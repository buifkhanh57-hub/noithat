'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ShoppingCart, Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#FF6A00', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1942', '#19AF42'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    appointments: 0,
    customers: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [revenueData, setRevenueData] = useState<{ name: string; revenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { count: productCount },
        { count: orderCount },
        { count: aptCount },
        { data: orders },
        { count: customerCount },
        { count: pendingCount },
        { data: products },
        { data: categories },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total, created_at'),
        supabase.from('auth.users').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('products').select('category_id'),
        supabase.from('categories').select('id, name'),
      ]);

      const revenue = (orders || []).reduce((sum, o) => sum + (o.total || 0), 0);

      // Revenue by month (last 6)
      const now = new Date();
      const months: { name: string; revenue: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('vi-VN', { month: 'short' });
        const monthRev = (orders || [])
          .filter((o) => {
            const od = new Date(o.created_at);
            return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
          })
          .reduce((sum, o) => sum + (o.total || 0), 0);
        months.push({ name: monthName, revenue: monthRev });
      }
      setRevenueData(months);

      // Products by category
      const catMap = new Map((categories || []).map((c) => [c.id, c.name]));
      const prodByCat = (products || []).reduce((acc, p) => {
        const name = p.category_id ? catMap.get(p.category_id) || 'Khác' : 'Khác';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setCategoryData(Object.entries(prodByCat).map(([name, value]) => ({ name, value })));

      setStats({
        products: productCount || 0,
        orders: orderCount || 0,
        appointments: aptCount || 0,
        customers: customerCount || 0,
        revenue,
        pendingOrders: pendingCount || 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const cards = [
    { label: 'Tổng doanh thu', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-green-600' },
    { label: 'Sản phẩm', value: stats.products, icon: Package, color: 'text-blue-600' },
    { label: 'Đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'text-orange-600' },
    { label: 'Đơn chờ xử lý', value: stats.pendingOrders, icon: TrendingUp, color: 'text-amber-600' },
    { label: 'Lịch hẹn', value: stats.appointments, icon: Calendar, color: 'text-purple-600' },
    { label: 'Khách hàng', value: stats.customers, icon: Users, color: 'text-indigo-600' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Tổng quan</h1>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <div className={`rounded-full bg-neutral-100 p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 font-semibold">Doanh thu 6 tháng gần nhất</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
              <Tooltip formatter={(v) => formatPrice(v as number)} />
              <Bar dataKey="revenue" fill="#FF6A00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 font-semibold">Sản phẩm theo danh mục</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-16 text-center text-muted-foreground">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
