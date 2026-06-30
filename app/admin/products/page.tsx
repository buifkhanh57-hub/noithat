'use client';

import { useEffect, useState } from 'react';
import { supabase, formatPrice, type Product, type Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  images: string;
  color: string;
  material: string;
  size: string;
  stock: number;
  is_featured: boolean;
  is_promo: boolean;
};

const EMPTY: ProductForm = {
  name: '', slug: '', description: '', price: 0, discount_price: null,
  category_id: '', images: '', color: '', material: '', size: '', stock: 0,
  is_featured: false, is_promo: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: p.price,
      discount_price: p.discount_price,
      category_id: p.category_id || '',
      images: (p.images || []).join('\n'),
      color: p.color || '',
      material: p.material || '',
      size: p.size || '',
      stock: p.stock,
      is_featured: p.is_featured,
      is_promo: p.is_promo,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || form.price <= 0) {
      toast.error('Vui lòng điền tên, slug và giá');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      price: form.price,
      discount_price: form.discount_price || null,
      category_id: form.category_id || null,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      color: form.color.trim() || null,
      material: form.material.trim() || null,
      size: form.size.trim() || null,
      stock: form.stock,
      is_featured: form.is_featured,
      is_promo: form.is_promo,
    };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) toast.error('Cập nhật thất bại');
      else toast.success('Đã cập nhật sản phẩm');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Thêm sản phẩm thất bại');
      else toast.success('Đã thêm sản phẩm');
    }
    setSaving(false);
    setDialogOpen(false);
    await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    if (error) toast.error('Xóa thất bại');
    else toast.success('Đã xóa sản phẩm');
    setDeleteId(null);
    await fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button onClick={openCreate} className="brand-bg text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Không có sản phẩm</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-left">Giá</th>
                <th className="p-3 text-left">Tồn kho</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(p.discount_price || p.price)}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {p.is_featured && <span className="rounded bg-black px-1.5 py-0.5 text-xs text-white">Nổi bật</span>}
                      {p.is_promo && <span className="rounded brand-bg px-1.5 py-0.5 text-xs text-white">KM</span>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Tên sản phẩm *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1 block">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Giá (VNĐ) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label className="mb-1 block">Giá giảm (VNĐ)</Label>
                <Input type="number" value={form.discount_price ?? ''} onChange={(e) => setForm({ ...form, discount_price: e.target.value ? parseInt(e.target.value) : null })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1 block">Danh mục</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block">Màu sắc</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1 block">Chất liệu</Label>
                <Input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1 block">Kích thước</Label>
                <Input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>
              <div>
                <Label className="mb-1 block">Tồn kho</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div>
              <Label className="mb-1 block">Ảnh (mỗi dòng 1 URL)</Label>
              <Textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3} placeholder="https://..." />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: !!v })} id="feat" />
                <Label htmlFor="feat">Sản phẩm nổi bật</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.is_promo} onCheckedChange={(v) => setForm({ ...form, is_promo: !!v })} id="promo" />
                <Label htmlFor="promo">Khuyến mãi</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={saving} className="brand-bg text-white hover:opacity-90">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc muốn xóa sản phẩm này? Hành động không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
