'use client';

import { useEffect, useState } from 'react';
import { supabase, type Voucher } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState<number | null>(null);
  const [minOrder, setMinOrder] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    setVouchers(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setCode(''); setDiscountPercent(10); setMaxDiscount(null); setMinOrder(null); setIsActive(true); setDialogOpen(true); };
  const openEdit = (v: Voucher) => { setEditing(v); setCode(v.code); setDiscountPercent(v.discount_percent); setMaxDiscount(v.max_discount); setMinOrder(v.min_order); setIsActive(v.is_active); setDialogOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountPercent <= 0) { toast.error('Vui lòng nhập mã và phần trăm giảm'); return; }
    setSaving(true);
    const payload = { code: code.trim().toUpperCase(), discount_percent: discountPercent, max_discount: maxDiscount, min_order: minOrder, is_active: isActive };
    if (editing) {
      const { error } = await supabase.from('vouchers').update(payload).eq('id', editing.id);
      if (error) toast.error('Cập nhật thất bại'); else toast.success('Đã cập nhật');
    } else {
      const { error } = await supabase.from('vouchers').insert(payload);
      if (error) toast.error('Thêm thất bại'); else toast.success('Đã thêm');
    }
    setSaving(false); setDialogOpen(false); await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('vouchers').delete().eq('id', deleteId);
    if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa');
    setDeleteId(null); await fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý khuyến mãi</h1>
        <Button onClick={openCreate} className="brand-bg text-white hover:opacity-90"><Plus className="mr-2 h-4 w-4" />Thêm mã</Button>
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-3 text-left">Mã</th><th className="p-3 text-left">Giảm</th><th className="p-3 text-left">Tối đa</th><th className="p-3 text-left">Đơn tối thiểu</th><th className="p-3 text-left">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3 font-mono font-bold">{v.code}</td>
                  <td className="p-3">{v.discount_percent}%</td>
                  <td className="p-3">{v.max_discount ? v.max_discount.toLocaleString('vi-VN') + 'đ' : '-'}</td>
                  <td className="p-3">{v.min_order ? v.min_order.toLocaleString('vi-VN') + 'đ' : '-'}</td>
                  <td className="p-3">{v.is_active ? <span className="text-green-600">Hoạt động</span> : <span className="text-muted-foreground">Tắt</span>}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(v.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div><Label className="mb-1 block">Mã *</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <div><Label className="mb-1 block">Phần trăm giảm *</Label><Input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)} /></div>
            <div><Label className="mb-1 block">Giảm tối đa (VNĐ)</Label><Input type="number" value={maxDiscount ?? ''} onChange={(e) => setMaxDiscount(e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div><Label className="mb-1 block">Đơn hàng tối thiểu (VNĐ)</Label><Input type="number" value={minOrder ?? ''} onChange={(e) => setMinOrder(e.target.value ? parseInt(e.target.value) : null)} /></div>
            <div className="flex items-center gap-2"><Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} id="vactive" /><Label htmlFor="vactive">Hoạt động</Label></div>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button><Button type="submit" disabled={saving} className="brand-bg text-white hover:opacity-90">{saving ? 'Đang lưu...' : 'Lưu'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa mã này?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
