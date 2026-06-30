import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-muted">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Không tìm thấy trang</h2>
      <p className="mt-2 text-muted-foreground">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link href="/" className="mt-6">
        <Button className="brand-bg text-white hover:opacity-90">Về trang chủ</Button>
      </Link>
    </div>
  );
}
