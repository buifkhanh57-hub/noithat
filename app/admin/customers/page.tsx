'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

type Customer = { id: string; email: string; created_at: string };

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('auth.users').select('id, email, created_at').order('created_at', { ascending: false });
      setCustomers((data || []) as Customer[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý khách hàng</h1>
      <p className="mb-4 text-sm text-muted-foreground">Tổng số: {customers.length} khách hàng</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-left">Email</th><th className="p-3 text-left">Ngày đăng ký</th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-medium">{c.email}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
