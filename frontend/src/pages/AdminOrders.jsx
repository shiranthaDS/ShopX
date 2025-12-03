import { useEffect, useState } from 'react';

const ORDER_API_BASE = import.meta.env.VITE_ORDER_API_BASE || 'http://localhost:4005';

export default function AdminOrders() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const saveOrder = async (o) => {
    try {
      setSavingId(o._id);
      const res = await fetch(`${ORDER_API_BASE}/api/orders/${o._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: o.deliveryStatus, trackingNumber: o.trackingNumber || '' })
      });
      if (!res.ok) throw new Error(`Save failed ${res.status}`);
      const updated = await res.json();
      setData(prev => ({ ...prev, items: prev.items.map(i => i._id === updated._id ? updated : i) }));
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSavingId('');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ORDER_API_BASE}/api/orders`, { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed ${res.status}`);
        const j = await res.json();
        setData(j);
      } catch (e) {
        setError(e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-sm">Loading orders…</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Orders</h1>
      <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="min-w-full text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800/40">
            <tr>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Paid</th>
              <th className="px-3 py-2 text-left">Currency</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Shipping</th>
              <th className="px-3 py-2 text-left">Items</th>
              <th className="px-3 py-2 text-left">Item Details</th>
              <th className="px-3 py-2 text-left">Delivery Status</th>
              <th className="px-3 py-2 text-left">Tracking #</th>
              <th className="px-3 py-2 text-left">Actions</th>
              <th className="px-3 py-2 text-left">Totals (local)</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(o => (
              <tr key={o._id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-3 py-2 font-mono">{o.orderId}</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">{(o.totalPaid || 0).toFixed(2)}</td>
                <td className="px-3 py-2">{o.currency}</td>
                <td className="px-3 py-2">{o.shipping?.fullName || `${o.payer?.name?.given_name || ''} ${o.payer?.name?.surname || ''}`}</td>
                <td className="px-3 py-2">{o.payer?.email || o.shipping?.email}</td>
                <td className="px-3 py-2">
                  <div className="max-w-[260px] truncate">
                    {[o.shipping?.addressLine1, o.shipping?.addressLine2, o.shipping?.city, o.shipping?.state, o.shipping?.postalCode, o.shipping?.country].filter(Boolean).join(', ')}
                  </div>
                </td>
                <td className="px-3 py-2">{o.items?.length || 0}</td>
                <td className="px-3 py-2">
                  {o.items?.length ? (
                    <div className="max-w-[360px] text-[11px] text-gray-700 dark:text-gray-300">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="truncate">
                          {it.title || 'Item'} × {it.quantity || 1} — {(it.total ?? ((it.price || 0) * (it.quantity || 1))).toFixed(2)} {o.localCurrency || 'LKR'}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-500">No items</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <select
                    className="text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1"
                    value={o.deliveryStatus || 'awaiting_shipment'}
                    onChange={(e) => setData(prev => ({ ...prev, items: prev.items.map(i => i._id === o._id ? { ...i, deliveryStatus: e.target.value } : i) }))}
                  >
                    <option value="awaiting_shipment">Awaiting Shipment</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="text-xs bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1 w-40"
                    value={o.trackingNumber || ''}
                    placeholder="Enter tracking"
                    onChange={(e) => setData(prev => ({ ...prev, items: prev.items.map(i => i._id === o._id ? { ...i, trackingNumber: e.target.value } : i) }))}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    className="text-xs underline"
                    disabled={savingId === o._id}
                    onClick={() => saveOrder(o)}
                  >
                    {savingId === o._id ? 'Saving…' : 'Save'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  {(o.cartTotalLocal || 0).toFixed(2)} {o.localCurrency}
                </td>
                <td className="px-3 py-2 text-[11px] text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
