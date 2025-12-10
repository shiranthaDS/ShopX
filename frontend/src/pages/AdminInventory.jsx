import { useEffect, useState } from 'react';

const INVENTORY_API_BASE = 'https://inventory-service.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allRes, lowRes] = await Promise.all([
          fetch(`${INVENTORY_API_BASE}/api/inventory`, { credentials: 'include' }),
          fetch(`${INVENTORY_API_BASE}/api/inventory/low`, { credentials: 'include' }),
        ]);
        if (!allRes.ok) throw new Error(`Inventory failed ${allRes.status}`);
        if (!lowRes.ok) throw new Error(`Low stock failed ${lowRes.status}`);
        const all = await allRes.json();
        const lows = await lowRes.json();
        setItems(all.items || []);
        setLow(lows.items || []);
      } catch (e) {
        setError(e.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-sm">Loading inventory…</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inventory</h1>
        <button
          className="text-xs underline"
          disabled={syncing}
          onClick={async () => {
            try {
              setSyncing(true);
              const res = await fetch(`${INVENTORY_API_BASE}/api/inventory/sync`, { method: 'POST', credentials: 'include' });
              if (!res.ok) throw new Error(`Sync failed ${res.status}`);
              // reload lists
              const [allRes, lowRes] = await Promise.all([
                fetch(`${INVENTORY_API_BASE}/api/inventory`, { credentials: 'include' }),
                fetch(`${INVENTORY_API_BASE}/api/inventory/low`, { credentials: 'include' }),
              ]);
              const all = await allRes.json();
              const lows = await lowRes.json();
              setItems(all.items || []);
              setLow(lows.items || []);
            } catch (e) {
              setError(e.message || 'Sync failed');
            } finally {
              setSyncing(false);
            }
          }}
        >
          {syncing ? 'Syncing…' : 'Sync from products'}
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">All Products</div>
        <div className="overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Stock</th>
                <th className="px-3 py-2 text-left">Threshold</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {it.imageUrl && <img src={it.imageUrl} alt="" className="h-6 w-6 rounded object-cover" />}
                      <div className="truncate max-w-[240px]">{it.title}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{it.sku || '-'}</td>
                  <td className="px-3 py-2">{it.stock}</td>
                  <td className="px-3 py-2">{it.lowStockThreshold}</td>
                  <td className="px-3 py-2">{(it.price || 0).toFixed(2)}</td>
                  <td className="px-3 py-2">{it.category || '-'}</td>
                  <td className="px-3 py-2 text-[11px] text-gray-500">{new Date(it.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-yellow-100/40 dark:text-yellow-200">Low Stock</div>
        <div className="overflow-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">Stock</th>
                <th className="px-3 py-2 text-left">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {low.length ? low.map(it => (
                <tr key={it._id} className="border-t border-gray-200 dark:border-gray-800 bg-yellow-50 dark:bg-yellow-900/20">
                  <td className="px-3 py-2">{it.title}</td>
                  <td className="px-3 py-2">{it.stock}</td>
                  <td className="px-3 py-2">{it.lowStockThreshold}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-3 py-2" colSpan={3}>No low stock items.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
