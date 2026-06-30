/*
# NoiThatGiaRe - E-commerce Schema

1. Overview
Furniture e-commerce with categories, products, reviews, appointments, orders, carts, vouchers, banners.
Multi-user: customers sign in, admin manages. Uses Supabase auth.

2. Tables
- admin_profiles: marks users as admin (role) - created FIRST
- categories: product categories
- products: furniture items
- reviews: product reviews
- appointments: showroom visit bookings
- orders: customer orders
- order_items: line items
- carts: persistent cart per user
- cart_items: items in cart
- vouchers: discount codes
- banners: homepage banners

3. Security
- RLS enabled on all tables.
- Public read for catalog (categories, products, reviews, banners, vouchers).
- Customers write their own data.
- Admins (via admin_profiles) get full CRUD.
*/

-- Admin profiles (role marker) - MUST be first
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_admin_profiles" ON admin_profiles;
CREATE POLICY "admin_read_admin_profiles" ON admin_profiles FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.user_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_admin_profiles" ON admin_profiles;
CREATE POLICY "admin_manage_admin_profiles" ON admin_profiles FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles ap WHERE ap.user_id = auth.uid())
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_manage_categories" ON categories;
CREATE POLICY "admin_manage_categories" ON categories FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price integer NOT NULL,
  discount_price integer,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  video_url text,
  color text,
  material text,
  size text,
  rating numeric(2,1) DEFAULT 0,
  stock integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_promo boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_manage_products" ON products;
CREATE POLICY "admin_manage_products" ON products FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  user_name text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "user_insert_review" ON reviews;
CREATE POLICY "user_insert_review" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_update_own_review" ON reviews;
CREATE POLICY "user_update_own_review" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_delete_own_review" ON reviews;
CREATE POLICY "user_delete_own_review" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_delete_review" ON reviews;
CREATE POLICY "admin_delete_review" ON reviews FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  name text NOT NULL,
  phone text NOT NULL,
  address text,
  date date NOT NULL,
  time text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','rejected','completed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_read_own_appointments" ON appointments;
CREATE POLICY "user_read_own_appointments" ON appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_insert_appointment" ON appointments;
CREATE POLICY "user_insert_appointment" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_manage_appointments" ON appointments;
CREATE POLICY "admin_manage_appointments" ON appointments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  total integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  shipping_address text,
  phone text,
  voucher_code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_read_own_orders" ON orders;
CREATE POLICY "user_read_own_orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_insert_order" ON orders;
CREATE POLICY "user_insert_order" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_manage_orders" ON orders;
CREATE POLICY "admin_manage_orders" ON orders FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  price integer NOT NULL,
  quantity integer NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_read_own_order_items" ON order_items;
CREATE POLICY "user_read_own_order_items" ON order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "user_insert_order_item" ON order_items;
CREATE POLICY "user_insert_order_item" ON order_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "admin_manage_order_items" ON order_items;
CREATE POLICY "admin_manage_order_items" ON order_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_manage_own_cart" ON carts;
CREATE POLICY "user_manage_own_cart" ON carts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_manage_own_cart_items" ON cart_items;
CREATE POLICY "user_manage_own_cart_items" ON cart_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Vouchers
CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent integer NOT NULL,
  max_discount integer,
  min_order integer,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_vouchers" ON vouchers;
CREATE POLICY "public_read_vouchers" ON vouchers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_manage_vouchers" ON vouchers;
CREATE POLICY "admin_manage_vouchers" ON vouchers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_banners" ON banners;
CREATE POLICY "public_read_banners" ON banners FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_manage_banners" ON banners;
CREATE POLICY "admin_manage_banners" ON banners FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
