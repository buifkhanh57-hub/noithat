'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!current) e.current = 'Vui lòng nhập mật khẩu hiện tại';
    if (!newPwd) e.new = 'Vui lòng nhập mật khẩu mới';
    else if (newPwd.length < 6) e.new = 'Mật khẩu tối thiểu 6 ký tự';
    if (newPwd !== confirm) e.confirm = 'Xác nhận mật khẩu không khớp';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success('Đổi mật khẩu thành công');
    setCurrent('');
    setNewPwd('');
    setConfirm('');
    setLoading(false);
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <Label className="mb-1 block">Mật khẩu hiện tại</Label>
          <div className="relative">
            <Input
              type={show ? 'text' : 'password'}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.current && <p className="mt-1 text-xs text-destructive">{errors.current}</p>}
        </div>
        <div>
          <Label className="mb-1 block">Mật khẩu mới</Label>
          <Input
            type={show ? 'text' : 'password'}
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
          />
          {errors.new && <p className="mt-1 text-xs text-destructive">{errors.new}</p>}
        </div>
        <div>
          <Label className="mb-1 block">Xác nhận mật khẩu mới</Label>
          <Input
            type={show ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
        </div>
        <Button type="submit" disabled={loading} className="brand-bg text-white hover:opacity-90">
          {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </Button>
      </form>
    </div>
  );
}
