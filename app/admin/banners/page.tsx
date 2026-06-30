'use client';

import { useEffect, useState } from 'react';
import { supabase, type Banner } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('sort_order');
    setBanners(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setTitle(''); setImageUrl(''); setLinkUrl(''); setIsActive(true); setSortOrder(0); setDialogOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setTitle(b.title || ''); setImageUrl(b.image_url); setLinkUrl(b.link_url || ''); setIsActive(b.is_active); setSortOrder(b.sort_order); setDialogOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) { toast.error('Vui lòng nhập URL ảnh'); return; }
    setSaving(true);
    const payload = { title: title.trim() || null, image_url: imageUrl.trim(), link_url: linkUrl.trim() || null, is_active: isActive, sort_order: sortOrder };
    if (editing) {
      const { error } = await supabase.from('banners').update(payload).eq('id', editing.id);
      if (error) toast.error('Cập nhật thất bại'); else toast.success('Đã cập nhật');
    } else {
      const { error } = await supabase.from('banners').insert(payload);
      if (error) toast.error('Thêm thất bại'); else toast.success('Đã thêm');
    }
    setSaving(false); setDialogOpen(false); await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('banners').delete().eq('id', deleteId);
    if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa');
    setDeleteId(null); await fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý banner</h1>
        <Button onClick={openCreate} className="brand-bg text-white hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Thêm banner</Button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-lg border">
              <div className="relative h-40 bg-muted">
                <img src={b.image_url} alt={b.title || 'Banner'} className="h-full w-full object-cover" />
                {!b.is_active && <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">Ẩn</span>}
              </div>
              <div className="flex items-center justify-between p-3">
                <div><p className="font-medium">{b.title || 'Không tiêu đề'}</p><p className="text-xs text-muted-foreground">Thứ tự: {b.sort_order}</p></div>
                <div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Sửa banner' : 'Thêm banner'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label className="mb-1 block">Tiêu đề</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label className="mb-1 block">URL ảnh *</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
            <div><Label className="mb-1 block">Link điều hướng</Label><Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/category/sofa" /></div>
            <div><Label className="mb-1 block">Thứ tự</Label><Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} /></div>
            <div className="flex items-center gap-2"><Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} id="active" /><Label htmlFor="active">Hiển thị</Label></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button><Button type="submit" disabled={saving} className="brand-bg text-white hover:opacity-90">{saving ? 'Đang lưu...' : 'Lưu'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa banner này?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
