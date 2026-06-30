import Link from 'next/link';
import { Phone, MapPin, Facebook, MessageCircle } from 'lucide-react';

const CONTACTS = [
  {
    label: 'CS1',
    address: 'Long Xuyên - Phúc Thọ - Hà Nội',
  },
  {
    label: 'CS2',
    address: 'Phú Hòa - Thạch Thất - Hà Nội',
  },
  {
    label: 'CS3',
    address: 'Đồng Thái - An Dương - Hải Phòng',
  },
];

const HOTLINES = ['0866 062 818', '0972 990 557'];
const FACEBOOK_URL = 'https://www.facebook.com/share/18jS1ZxWAb/?mibextid=wwXIfr';

export function SiteFooter() {
  return (
    <footer className="border-t bg-neutral-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold">
              <span className="text-black">NoiThat</span>
              <span className="brand-text">GiaRe</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Nội thất giá rẻ, chất lượng cao. Giao hàng toàn quốc, lắp đặt tận nơi.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Danh mục</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/sofa" className="hover:text-foreground">Sofa</Link></li>
              <li><Link href="/category/ghe" className="hover:text-foreground">Ghế</Link></li>
              <li><Link href="/category/ban" className="hover:text-foreground">Bàn</Link></li>
              <li><Link href="/category/giuong" className="hover:text-foreground">Giường</Link></li>
              <li><Link href="/category/den" className="hover:text-foreground">Đèn</Link></li>
            </ul>
          </div>

          {/* Showrooms */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Cơ sở</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {CONTACTS.map((c) => (
                <li key={c.label} className="flex gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    <strong>{c.label}:</strong> {c.address}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {HOTLINES.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <a href={`tel:${h.replace(/\s/g, '')}`} className="hover:text-foreground">{h}</a>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Facebook className="h-4 w-4 flex-shrink-0" />
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Facebook</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span>Zalo: {HOTLINES[0]}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NoiThatGiaRe. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
