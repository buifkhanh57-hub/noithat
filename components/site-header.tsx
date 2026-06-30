'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, X, Bell, Calendar, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { name: 'Sofa', slug: 'sofa' },
  { name: 'Ghế', slug: 'ghe' },
  { name: 'Bàn', slug: 'ban' },
  { name: 'Giường', slug: 'giuong' },
  { name: 'Tủ', slug: 'tu' },
  { name: 'Kệ', slug: 'ke' },
  { name: 'Đèn', slug: 'den' },
  { name: 'Nội thất văn phòng', slug: 'noi-that-van-phong' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; slug: string; price: number }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const h = localStorage.getItem('search_history');
      if (h) setSearchHistory(JSON.parse(h));
    } catch {}
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price')
        .ilike('name', `%${search}%`)
        .limit(5);
      setSuggestions(data || []);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    const q = search.trim();
    const newHistory = [q, ...searchHistory.filter((h) => h !== q)].slice(0, 5);
    setSearchHistory(newHistory);
    try {
      localStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch {}
    setShowSuggest(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur transition-all duration-200',
        scrolled ? 'py-1 shadow-sm' : 'py-2'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-black">NoiThat</span>
              <span className="brand-text">GiaRe</span>
            </span>
          </Link>

          {/* Search - desktop */}
          <div ref={searchRef} className="relative hidden flex-1 max-w-2xl md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggest(true);
                  }}
                  onFocus={() => setShowSuggest(true)}
                  className="h-10 pl-10"
                />
              </div>
            </form>
            {showSuggest && (search.trim() || searchHistory.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-white shadow-lg animate-fade-in">
                {search.trim() && suggestions.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-1 text-xs font-medium text-muted-foreground">Sản phẩm gợi ý</p>
                    {suggestions.map((s) => (
                      <Link
                        key={s.id}
                        href={`/product/${s.slug}`}
                        onClick={() => setShowSuggest(false)}
                        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted"
                      >
                        <span>{s.name}</span>
                        <span className="text-muted-foreground">{s.price.toLocaleString('vi-VN')}đ</span>
                      </Link>
                    ))}
                  </div>
                ) : !search.trim() && searchHistory.length > 0 ? (
                  <div className="py-2">
                    <p className="px-4 py-1 text-xs font-medium text-muted-foreground">Lịch sử tìm kiếm</p>
                    {searchHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearch(h);
                          router.push(`/search?q=${encodeURIComponent(h)}`);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      >
                        <Search className="h-3 w-3 text-muted-foreground" />
                        {h}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {count > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-xs brand-bg text-white">
                    {count}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Appointments */}
            <Link href="/appointment" className="hidden sm:block">
              <Button variant="ghost" size="icon" title="Đặt lịch">
                <Calendar className="h-5 w-5" />
              </Button>
            </Link>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Tài khoản</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">Đơn hàng của tôi</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/appointments">Lịch hẹn của tôi</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Quản trị
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Đăng nhập</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search - mobile */}
        <div className="mt-2 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10"
              />
            </div>
          </form>
        </div>

        {/* Categories nav - desktop */}
        <nav className="mt-2 hidden items-center gap-1 md:flex">
          <Link
            href="/category/all"
            className={cn(
              'rounded px-3 py-1.5 text-sm font-medium hover:bg-muted',
              pathname === '/category/all' && 'bg-muted'
            )}
          >
            Tất cả
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className={cn(
                'rounded px-3 py-1.5 text-sm font-medium hover:bg-muted',
                pathname === `/category/${cat.slug}` && 'bg-muted'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="mt-2 flex flex-col gap-1 border-t pt-2 md:hidden">
            <Link href="/category/all" className="rounded px-3 py-2 text-sm font-medium hover:bg-muted">Tất cả</Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="rounded px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {cat.name}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t pt-2">
              {!user && (
                <>
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">Đăng nhập</Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full" size="sm">Đăng ký</Button>
                  </Link>
                </>
              )}
              <Link href="/appointment" className="flex-1">
                <Button variant="outline" className="w-full" size="sm">Đặt lịch</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
