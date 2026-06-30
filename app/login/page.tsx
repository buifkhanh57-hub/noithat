'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email không hợp lệ';
    if (!password) e.password = 'Vui lòng nhập mật khẩu';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : error.message);
      setLoading(false);
      return;
    }
    toast.success('Đăng nhập thành công');
    // Check if admin
    const { data: adminData } = await supabase
      .from('admin_profiles')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (adminData) {
      router.push('/admin');
    } else {
      router.push('/');
    }
    router.refresh();
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-8">
      <div className="w-full rounded-lg border p-8">
        <h1 className="mb-1 text-2xl font-bold">Đăng nhập</h1>
        <p className="mb-6 text-sm text-muted-foreground">Đăng nhập để tiếp tục mua sắm</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 block">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label className="mb-1 block">Mật khẩu</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal">Ghi nhớ tôi</Label>
            </div>
            <Link href="/forgot-password" className="text-sm text-brand hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Button type="submit" disabled={loading} className="w-full brand-bg text-white hover:opacity-90">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-brand font-medium hover:underline">
            Đăng ký
          </Link>
        </p>

        <div className="mt-4 rounded bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium">Tài khoản admin mẫu:</p>
          <p>Email: admin@gmail.com</p>
          <p>Mật khẩu: admin123456</p>
        </div>
      </div>
    </div>
  );
}
