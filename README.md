# NoiThatGiaRe - Website Nội Thất Trực Tuyến

Website thương mại điện tử nội thất chuyên nghiệp, xây dựng với Next.js, React, TypeScript, Tailwind CSS và Supabase.

## Tính năng

### Khách hàng
- Trang chủ với banner, danh mục, sản phẩm nổi bật, infinite scroll
- Tìm kiếm realtime với gợi ý và lịch sử
- Danh mục với bộ lọc (giá, màu, chất liệu, đánh giá, khuyến mãi)
- Chi tiết sản phẩm: gallery, zoom, video, đánh giá, sản phẩm liên quan
- Giỏ hàng: thêm/xóa/cập nhật, voucher, thanh toán
- Đặt lịch hẹn xem nội thất với theo dõi trạng thái
- Đăng ký/đăng nhập, quên mật khẩu, đổi mật khẩu
- Lịch sử đơn hàng và lịch hẹn

### Admin
- Dashboard với thống kê doanh thu, biểu đồ
- Quản lý sản phẩm (CRUD, upload ảnh qua URL)
- Quản lý danh mục, banner, khuyến mãi
- Quản lý đơn hàng, lịch hẹn, bình luận
- Quản lý khách hàng
- Thống kê doanh thu chi tiết

### Tài khoản admin mẫu
- Email: admin@gmail.com
- Mật khẩu: admin123456

## Công nghệ
- **Frontend**: Next.js 13, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod
- **Notifications**: Sonner

## Cài đặt

```bash
npm install
cp .env.example .env  # Điền Supabase credentials
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Cấu trúc thư mục

```
app/
  account/          # Trang tài khoản khách hàng
  admin/            # Dashboard admin
  appointment/      # Đặt lịch hẹn
  cart/             # Giỏ hàng
  category/         # Trang danh mục
  forgot-password/  # Quên mật khẩu
  login/            # Đăng nhập
  product/          # Chi tiết sản phẩm
  register/         # Đăng ký
  search/           # Tìm kiếm
components/
  ui/               # shadcn/ui components
  site-header.tsx   # Header
  site-footer.tsx   # Footer
  product-card.tsx  # Card sản phẩm
  floating-contact.tsx  # Nút liên hệ nổi
lib/
  supabase.ts       # Supabase client + types
  auth-context.tsx  # Auth context
  cart-context.tsx  # Cart context
```

## Liên hệ
- CS1: Long Xuyên - Phúc Thọ - Hà Nội
- CS2: Phú Hòa - Thạch Thất - Hà Nội
- CS3: Đồng Thái - An Dương - Hải Phòng
- Hotline: 0866 062 818 / 0972 990 557
