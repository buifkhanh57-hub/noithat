'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-6xl font-bold text-neutral-300">500</h1>
          <h2 className="mt-4 text-xl font-semibold">Lỗi hệ thống</h2>
          <p className="mt-2 text-neutral-500">Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={reset} className="rounded border px-4 py-2">Thử lại</button>
            <Link href="/" className="rounded bg-orange-500 px-4 py-2 text-white">Về trang chủ</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
