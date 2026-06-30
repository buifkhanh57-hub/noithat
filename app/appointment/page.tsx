'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, type Appointment } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const STATUS_CONFIG = {
  pending: { label: 'Chờ xác nhận', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Đã từ chối', icon: XCircle, color: 'bg-red-100 text-red-700' },
  completed: { label: 'Hoàn thành', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
};

export default function AppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.email || '');
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) {
      setLoadingList(false);
      return;
    }
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMyAppointments(data || []);
    setLoadingList(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt lịch');
      router.push('/login');
      return;
    }
    if (!name.trim() || !phone.trim() || !date || !time) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || null,
      date,
      time,
      note: note.trim() || null,
    });
    if (error) {
      toast.error('Đặt lịch thất bại');
      setSubmitting(false);
      return;
    }
    toast.success('Đặt lịch thành công! Chúng tôi sẽ liên hệ xác nhận.');
    setNote('');
    setAddress('');
    setTime('');
    setDate('');
    setSubmitting(false);
    await fetchAppointments();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Đặt lịch hẹn</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Calendar className="h-5 w-5" />
            Thông tin đặt lịch
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="mb-1 block">Họ tên *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <Label className="mb-1 block">Số điện thoại *</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0xxx xxx xxx"
              />
            </div>
            <div>
              <Label className="mb-1 block">Địa chỉ</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Địa chỉ của bạn"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Ngày *</Label>
                <Input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1 block">Giờ *</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((t) => (
                      <SelectItem key={t} value={t}>
                        <Clock className="mr-2 h-3.5 w-3.5" />
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Ghi chú</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm..."
                rows={3}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full brand-bg text-white hover:opacity-90">
              {submitting ? 'Đang gửi...' : 'Gửi đặt lịch'}
            </Button>
          </form>
        </div>

        {/* My appointments */}
        <div>
          <h2 className="mb-4 font-semibold">Lịch hẹn của tôi</h2>
          {!user ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              Vui lòng đăng nhập để xem lịch hẹn
            </div>
          ) : loadingList ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 rounded-lg border skeleton-shimmer" />
              ))}
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              Chưa có lịch hẹn nào
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map((apt) => {
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
                    {apt.note && (
                      <p className="mt-2 text-sm text-muted-foreground">Ghi chú: {apt.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
