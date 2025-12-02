import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../lib/cartApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext({ count: 0, cart: null, loading: false, refresh: async () => {}, add: async () => {} });

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setCart(null); return; }
    setLoading(true);
    try {
      const { cart } = await cartApi.get();
      setCart(cart);
    } catch (e) {
      // ignore when unauthorized
    } finally {
      setLoading(false);
    }
  };

  const add = async ({ productId, title, price, image, qty }) => {
    await cartApi.add({ productId, title, price, image, qty });
    await refresh();
  };

  useEffect(() => { refresh(); }, [user]);

  const count = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
  }, [cart]);

  const value = { count, cart, loading, refresh, add, setCart };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
