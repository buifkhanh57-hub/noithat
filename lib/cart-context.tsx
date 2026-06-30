'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase, type Product, type CartItem } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

type CartContextType = {
  items: CartItem[];
  count: number;
  loading: boolean;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  loading: false,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  refresh: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cart) {
        setItems([]);
        return;
      }

      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('id, cart_id, product_id, quantity')
        .eq('cart_id', cart.id);

      if (!cartItems || cartItems.length === 0) {
        setItems([]);
        return;
      }

      const productIds = cartItems.map((ci) => ci.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      const productMap = new Map((products || []).map((p) => [p.id, p]));
      const itemsWithProducts = cartItems.map((ci) => ({
        ...ci,
        product: productMap.get(ci.product_id),
      }));
      setItems(itemsWithProducts);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensureCart = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data: existing } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) return existing.id;
    const { data: created } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('id')
      .single();
    return created?.id ?? null;
  }, [user]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    const cartId = await ensureCart();
    if (!cartId) {
      toast.error('Không thể tạo giỏ hàng');
      return;
    }
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) {
        toast.error('Thêm vào giỏ hàng thất bại');
        return;
      }
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: product.id, quantity });
      if (error) {
        toast.error('Thêm vào giỏ hàng thất bại');
        return;
      }
    }
    toast.success('Đã thêm vào giỏ hàng');
    await refresh();
  }, [user, ensureCart, refresh]);

  const removeItem = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (error) {
      toast.error('Xóa sản phẩm thất bại');
      return;
    }
    toast.success('Đã xóa sản phẩm');
    await refresh();
  }, [refresh]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    if (error) {
      toast.error('Cập nhật thất bại');
      return;
    }
    await refresh();
  }, [refresh]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!cart) return;
    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    await refresh();
  }, [user, refresh]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, loading, addItem, removeItem, updateQuantity, clearCart, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
