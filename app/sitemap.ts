import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://noithatgiare.vn';
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/category/all`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ];

  const { data: categories } = await supabase.from('categories').select('slug');
  const catPages = (categories || []).map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const { data: products } = await supabase.from('products').select('slug, created_at');
  const productPages = (products || []).map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...catPages, ...productPages];
}
