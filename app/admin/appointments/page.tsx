'use client';

import { useEffect, useState } from 'react';
import { supabase, type Appointment } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const STATUSES = ['pending', 'confirmed', 'rejected', 'completed'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', rejected: 'Đã từ chối', completed: 'Hoàn thành',
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
    setAppointments(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) toast.error('Cập nhật thất bại');
    else { toast.success('Đã cập nhật trạng thái'); await fetchData(); }
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  if (appointments.length === 0) return <p className="py-8 text-center text-muted-foreground">Chưa có lịch hẹn</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý lịch hẹn</h1>
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{apt.name}</p>
                <p className="text-sm text-muted-foreground">{apt.phone}</p>
                <p className="mt-1 text-sm">{apt.date} lúc {apt.time}</p>
                {apt.address && <p className="text-sm text-muted-foreground">Địa chỉ: {apt.address}</p>}
                {apt.note && <p className="text-sm text-muted-foreground">Ghi chú: {apt.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                <Select value={apt.status} onValueChange={(v) => updateStatus(apt.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
