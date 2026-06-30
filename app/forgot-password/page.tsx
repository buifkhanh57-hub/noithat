'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-8">
      <div className="w-full rounded-lg border p-8">
        <h1 className="mb-1 text-2xl font-bold">Quên mật khẩu</h1>
        {sent ? (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              Email đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư.
            </p>
            <Link href="/login">
              <Button variant="outline">Quay lại đăng nhập</Button>
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-1 block">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full brand-bg text-white hover:opacity-90">
                {loading ? 'Đang gửi...' : 'Gửi liên kết'}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-brand font-medium hover:underline">
                Quay lại đăng nhập
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
