import { useEffect, useState } from 'react';
import { cartApi } from '../lib/cartApi.js';
import { formatMoney } from '../lib/money.js';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage() {
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { cart } = await cartApi.get();
      setCart(cart);
      const s = await cartApi.checkout();
      setSummary(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateQty = async (productId, qty) => {
    try {
      await cartApi.update({ productId, qty });
      await load();
      await refresh();
    } catch (e) { alert(e.message); }
  };

  const removeItem = async (productId) => {
    try {
      await cartApi.remove({ productId });
      await load();
      await refresh();
    } catch (e) { alert(e.message); }
  };

  const clear = async () => { await cartApi.clear(); await load(); await refresh(); };

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Your Cart</h1>
          <button onClick={clear} className="text-xs px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Clear</button>
        </div>
        {!cart?.items?.length ? (
          <div className="text-sm text-gray-500">Your cart is empty. <Link className="underline" to="/products">Browse products</Link>.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {cart.items.map((it) => (
              <li key={it.productId} className="py-3 flex gap-3">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {it.image ? <img src={it.image} alt={it.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-xs text-gray-500">{formatMoney(it.price)} each</div>
                    </div>
                    <button onClick={() => removeItem(it.productId)} className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-gray-800">Remove</button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <button onClick={() => updateQty(it.productId, Math.max(1, it.qty - 1))} className="px-2 py-1 text-xs">−</button>
                      <input type="number" min={1} max={99} value={it.qty} onChange={(e) => updateQty(it.productId, Math.max(1, Math.min(99, Number(e.target.value) || 1)))} className="w-12 text-center text-xs bg-transparent" />
                      <button onClick={() => updateQty(it.productId, Math.min(99, it.qty + 1))} className="px-2 py-1 text-xs">+</button>
                    </div>
                    <div className="text-sm font-medium">{formatMoney(it.total)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="lg:col-span-4 space-y-3">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold">Order Summary</h2>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatMoney(summary?.cart?.subtotal || 0)}</span></div>
            <div className="flex items-center justify-between"><span>Shipping</span><span>{formatMoney(summary?.shipping || 0)}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><span>{formatMoney(summary?.tax || 0)}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex items-center justify-between font-medium"><span>Total</span><span>{formatMoney(summary?.total || 0)}</span></div>
          </div>
          <button onClick={() => navigate('/checkout')} disabled={!cart?.items?.length} className="mt-3 w-full rounded-md px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Proceed to Checkout</button>
          <p className="mt-2 text-[11px] text-gray-500">By placing your order, you agree to our terms and privacy policy.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2">✓ Free returns within 30 days</div>
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2">✓ Secure checkout</div>
        </div>
      </aside>
    </div>
  );
}
