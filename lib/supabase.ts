import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  images: string[];
  video_url: string | null;
  color: string | null;
  material: string | null;
  size: string | null;
  rating: number;
  stock: number;
  is_featured: boolean;
  is_promo: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string;
  address: string | null;
  date: string;
  time: string;
  note: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  phone: string | null;
  voucher_code: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};

export type Voucher = {
  id: string;
  code: string;
  discount_percent: number;
  max_discount: number | null;
  min_order: number | null;
  expires_at: string | null;
  is_active: boolean;
};

export type Banner = {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
}

export function getEffectivePrice(p: Pick<Product, 'price' | 'discount_price'>): number {
  return p.discount_price && p.discount_price < p.price ? p.discount_price : p.price;
}

export function getDiscountPercent(p: Pick<Product, 'price' | 'discount_price'>): number {
  if (p.discount_price && p.discount_price < p.price) {
    return Math.round(((p.price - p.discount_price) / p.price) * 100);
  }
  return 0;
}
