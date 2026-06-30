import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { Toaster } from 'sonner';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FloatingContact } from '@/components/floating-contact';
import { ScrollToTop } from '@/components/scroll-to-top';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: {
    default: 'NoiThatGiaRe - Nội thất giá rẻ, chất lượng cao',
    template: '%s | NoiThatGiaRe',
  },
  description:
    'NoiThatGiaRe - Cửa hàng nội thất trực tuyến. Sofa, ghế, bàn, giường, tủ, kệ, đèn và nội thất văn phòng. Giá tốt, giao hàng toàn quốc.',
  keywords: ['nội thất', 'sofa', 'ghế', 'bàn', 'giường', 'tủ', 'kệ', 'đèn', 'nội thất văn phòng', 'NoiThatGiaRe'],
  openGraph: {
    title: 'NoiThatGiaRe - Nội thất giá rẻ, chất lượng cao',
    description: 'Cửa hàng nội thất trực tuyến. Đa dạng sản phẩm, giá tốt, giao hàng toàn quốc.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'NoiThatGiaRe',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoiThatGiaRe - Nội thất giá rẻ',
    description: 'Cửa hàng nội thất trực tuyến. Đa dạng sản phẩm, giá tốt.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <FloatingContact />
            <ScrollToTop />
            <Toaster position="top-right" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
