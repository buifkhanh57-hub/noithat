'use client';

import { useEffect, useState } from 'react';
import { supabase, type Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setName(''); setSlug(''); setIcon(''); setDialogOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setName(c.name); setSlug(c.slug); setIcon(c.icon || ''); setDialogOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) { toast.error('Vui lòng nhập tên và slug'); return; }
    setSaving(true);
    const payload = { name: name.trim(), slug: slug.trim(), icon: icon.trim() || null };
    if (editing) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
      if (error) toast.error('Cập nhật thất bại'); else toast.success('Đã cập nhật');
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) toast.error('Thêm thất bại'); else toast.success('Đã thêm');
    }
    setSaving(false); setDialogOpen(false); await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa');
    setDeleteId(null); await fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Button onClick={openCreate} className="brand-bg text-white hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" />Thêm danh mục
        </Button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-3 text-left">Tên</th><th className="p-3 text-left">Slug</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label className="mb-1 block">Tên *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label className="mb-1 block">Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></div>
            <div><Label className="mb-1 block">Icon (tùy chọn)</Label><Input value={icon} onChange={(e) => setIcon(e.target.value)} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={saving} className="brand-bg text-white hover:opacity-90">{saving ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa danh mục này?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
