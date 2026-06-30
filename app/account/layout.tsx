'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Package, Calendar, KeyRound, User, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const NAV = [
  { href: '/account', label: 'Tổng quan', icon: User },
  { href: '/account/orders', label: 'Đơn hàng', icon: Package },
  { href: '/account/appointments', label: 'Lịch hẹn', icon: Calendar },
  { href: '/account/password', label: 'Đổi mật khẩu', icon: KeyRound },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Tài khoản</h1>
      <div className="grid gap-6 md:grid-cols-4">
        <aside className="md:col-span-1">
          <div className="rounded-lg border p-4">
            <div className="mb-4 border-b pb-3">
              <p className="text-sm text-muted-foreground">Đăng nhập với</p>
              <p className="truncate font-medium">{user.email}</p>
            </div>
            <nav className="space-y-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                      active ? 'bg-muted font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={async () => {
                  await signOut();
                  router.push('/');
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </nav>
          </div>
        </aside>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
