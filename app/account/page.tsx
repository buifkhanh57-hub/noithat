'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user } = useAuth();
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Xin chào!</h2>
      <p className="text-muted-foreground">Email: {user?.email}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/account/orders">
          <Button variant="outline" className="w-full justify-start">Xem đơn hàng của tôi</Button>
        </Link>
        <Link href="/account/appointments">
          <Button variant="outline" className="w-full justify-start">Xem lịch hẹn của tôi</Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" className="w-full justify-start">Giỏ hàng</Button>
        </Link>
        <Link href="/appointment">
          <Button variant="outline" className="w-full justify-start">Đặt lịch mới</Button>
        </Link>
      </div>
    </div>
  );
}
