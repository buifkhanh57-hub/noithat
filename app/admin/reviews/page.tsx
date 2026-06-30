'use client';

import { useEffect, useState } from 'react';
import { supabase, type Review } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { product_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: reviewData } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!reviewData || reviewData.length === 0) { setReviews([]); setLoading(false); return; }
    const productIds = Array.from(new Set(reviewData.map((r) => r.product_id)));
    const { data: products } = await supabase.from('products').select('id, name').in('id', productIds);
    const prodMap = new Map((products || []).map((p) => [p.id, p.name]));
    setReviews(reviewData.map((r) => ({ ...r, product_name: r.product_id ? prodMap.get(r.product_id) : undefined })));
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('reviews').delete().eq('id', deleteId);
    if (error) toast.error('Xóa thất bại'); else toast.success('Đã xóa bình luận');
    setDeleteId(null); await fetchData();
  };

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Quản lý bình luận</h1>
      {reviews.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Chưa có bình luận</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{r.user_name || 'Ẩn danh'}</p>
                  <p className="text-xs text-muted-foreground">Sản phẩm: {r.product_name || 'Đã xóa'}</p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xác nhận xóa</AlertDialogTitle><AlertDialogDescription>Bạn có chắc muốn xóa bình luận này?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
