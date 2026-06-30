'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Package, FolderTree, Image, Users, Calendar, ShoppingCart, MessageSquare, Ticket, BarChart3, LogOut } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/banners', label: 'Banner', icon: Image },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/appointments', label: 'Lịch hẹn', icon: Calendar },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  { href: '/admin/reviews', label: 'Bình luận', icon: MessageSquare },
  { href: '/admin/vouchers', label: 'Khuyến mãi', icon: Ticket },
  { href: '/admin/stats', label: 'Thống kê', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin && pathname !== '/admin') {
        // Allow loading; will redirect if confirmed not admin
      }
    }
  }, [loading, user, isAdmin, router, pathname]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-96 w-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Không có quyền truy cập</h1>
        <p className="mt-2 text-muted-foreground">Bạn cần đăng nhập với tài khoản admin</p>
        <Link href="/login" className="mt-4 inline-block">
          <button className="rounded brand-bg px-4 py-2 text-white">Đăng nhập</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 border-r bg-white md:block">
        <div className="border-b p-4">
          <Link href="/admin" className="text-lg font-bold">
            <span className="text-black">NoiThat</span>
            <span className="brand-text">GiaRe</span>
          </Link>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                  active ? 'bg-neutral-900 text-white' : 'hover:bg-muted'
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
      </aside>

      {/* Mobile nav */}
      <div className="flex flex-1 flex-col">
        <div className="border-b bg-white p-3 md:hidden">
          <select
            value={pathname}
            onChange={(e) => router.push(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          >
            {NAV.map((item) => (
              <option key={item.href} value={item.href}>{item.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
