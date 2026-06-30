'use client';

import { useEffect, useState } from 'react';
import { supabase, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Đã từ chối', icon: XCircle, color: 'bg-red-100 text-red-700' },
  completed: { label: 'Hoàn thành', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
};

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setAppointments(data || []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (appointments.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Bạn chưa có lịch hẹn nào
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => {
        const cfg = STATUS_CONFIG[apt.status];
        const Icon = cfg.icon;
        return (
          <div key={apt.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{apt.name}</p>
                <p className="text-sm text-muted-foreground">{apt.phone}</p>
              </div>
              <Badge className={cfg.color}>
                <Icon className="mr-1 h-3 w-3" />
                {cfg.label}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {apt.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {apt.time}
              </span>
            </div>
            {apt.address && (
              <p className="mt-2 text-sm text-muted-foreground">Địa chỉ: {apt.address}</p>
            )}
            {apt.note && (
              <p className="mt-1 text-sm text-muted-foreground">Ghi chú: {apt.note}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
