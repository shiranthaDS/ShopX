import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { productsApi } from '../lib/productsApi.js';
import ProductCard from '../components/ProductCard.jsx';
import Button from '../components/Button.jsx';

export default function AdminProducts() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [archivedItems, setArchivedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBin, setShowBin] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', compareAtPrice: '', sku: '', brand: '', stock: '', categories: '', tags: '', attributes: '{}' });
  const [images, setImages] = useState([]);
  const imagePreviews = useMemo(() => images.map(f => URL.createObjectURL(f)), [images]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const admin = user?.role === 'admin';

  const load = async () => {
    setLoading(true);
    try {
      const data = await productsApi.list({ limit: 100 });
      setItems(data.items);
      const archived = await productsApi.listArchived({ limit: 100 });
      setArchivedItems(archived.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', price: '', compareAtPrice: '', sku: '', brand: '', stock: '', categories: '', tags: '', attributes: '{}' });
    setImages([]);
    setEditing(null);
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!admin) return;
    setSaving(true);
    setError('');
    try {
      const categories = form.categories.split(',').map(c => c.trim()).filter(Boolean);
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const attributes = form.attributes;
      if (editing) {
        await productsApi.update(editing._id, {
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          sku: form.sku,
          brand: form.brand,
          stock: form.stock ? parseInt(form.stock, 10) : undefined,
          categories,
          tags,
          attributes,
          images,
        });
      } else {
        await productsApi.create({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
          sku: form.sku,
          brand: form.brand,
          stock: form.stock ? parseInt(form.stock, 10) : undefined,
          categories,
          tags,
          attributes,
          images,
        });
      }
      resetForm();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? '',
      sku: p.sku ?? '',
      brand: p.brand ?? '',
      stock: p.stock ?? '',
      categories: p.categories.join(', '),
      tags: (p.tags || []).join(', '),
      attributes: JSON.stringify(p.attributes || {}),
    });
    setImages([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (p) => {
    if (!admin) return;
    if (!confirm(`Permanently delete product "${p.title}"? This removes it from the database and deletes images.`)) return;
    try {
      await productsApi.remove(p._id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onArchiveToggle = async (p) => {
    if (!admin) return;
    try {
      if (p.active) {
        await productsApi.archive(p._id);
      } else {
        await productsApi.restore(p._id);
      }
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onRemoveImage = async (p, url) => {
    if (!admin) return;
    try {
      await productsApi.removeImage(p._id, url);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  if (!admin) {
    return <div className="text-center py-12 text-sm text-gray-500">Admin access required.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h1>
        {error && <div className="mb-4 text-sm rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 px-3 py-2 text-rose-700 dark:text-rose-200">{error}</div>}
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500 md:col-span-2"
          />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={4}
              className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500 md:col-span-2"
            />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            required
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Compare at Price (optional)"
            value={form.compareAtPrice}
            onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            placeholder="SKU (optional)"
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            placeholder="Brand (optional)"
            value={form.brand}
            onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            placeholder="Categories (comma separated)"
            value={form.categories}
            onChange={e => setForm(f => ({ ...f, categories: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <textarea
            placeholder={'Attributes JSON (e.g. {"color":"red","size":"M"})'}
            value={form.attributes}
            onChange={e => setForm(f => ({ ...f, attributes: e.target.value }))}
            rows={3}
            className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500 md:col-span-2"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Images (max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => setImages(Array.from(e.target.files))}
              className="block w-full text-sm"
            />
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group">
                    <img src={src} alt="preview" className="h-20 w-full object-cover rounded-md" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 dark:bg-gray-800/80 text-xs rounded px-2 py-0.5 shadow"
                      onClick={() => setImages(imgs => imgs.filter((_, i) => i !== idx))}
                    >Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 md:col-span-2">
            <Button type="submit" loading={saving} className="flex-1">
              {editing ? 'Save Changes' : 'Add Product'}
            </Button>
            {editing && (
              <Button type="button" className="bg-gray-600 hover:bg-gray-700" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Existing Products</h2>
          <button
            type="button"
            onClick={() => setShowBin(b => !b)}
            className="text-sm rounded-md px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
          >{showBin ? 'Hide Recycle Bin' : 'Show Recycle Bin'}</button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : showBin ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {archivedItems.map(p => (
              <div key={p._id} className="relative group">
                <ProductCard product={{ ...p, active: false }} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => onArchiveToggle(p)}
                    className="rounded-md bg-white/80 dark:bg-gray-800/80 px-2 py-1 text-xs shadow hover:bg-emerald-50 dark:hover:bg-gray-700 text-emerald-700"
                  >Restore</button>
                  <button
                    onClick={() => onDelete(p)}
                    className="rounded-md bg-white/80 dark:bg-gray-800/80 px-2 py-1 text-xs shadow hover:bg-rose-50 dark:hover:bg-gray-700 text-rose-600"
                  >Del</button>
                </div>
              </div>
            ))}
            {!archivedItems.length && <div className="col-span-full text-center text-sm text-gray-500">Recycle bin is empty.</div>}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map(p => (
              <div key={p._id} className="relative group">
                <ProductCard product={p} />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => onArchiveToggle(p)}
                    className="rounded-md bg-white/80 dark:bg-gray-800/80 px-2 py-1 text-xs shadow hover:bg-amber-50 dark:hover:bg-gray-700 text-amber-700"
                  >Archive</button>
                  <button
                    onClick={() => onEdit(p)}
                    className="rounded-md bg-white/80 dark:bg-gray-800/80 px-2 py-1 text-xs shadow hover:bg-indigo-50 dark:hover:bg-gray-700"
                  >Edit</button>
                  <button
                    onClick={() => onDelete(p)}
                    className="rounded-md bg-white/80 dark:bg-gray-800/80 px-2 py-1 text-xs shadow hover:bg-rose-50 dark:hover:bg-gray-700 text-rose-600"
                  >Del</button>
                </div>
                {p.images?.length > 0 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {p.images.map((u) => (
                      <div key={u} className="relative">
                       
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!items.length && <div className="col-span-full text-center text-sm text-gray-500">No products yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
