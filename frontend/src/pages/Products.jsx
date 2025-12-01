import { useEffect, useState } from 'react';
import { productsApi } from '../lib/productsApi.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', search: '', minPrice: '', maxPrice: '' });

  const load = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const data = await productsApi.list({ page: p, category: f.category || undefined, search: f.search || undefined, minPrice: f.minPrice || undefined, maxPrice: f.maxPrice || undefined });
      setItems(data.items);
      setPages(data.pages);
      setPage(data.page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await productsApi.categories();
        setCategories(data.categories);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => { load(1, filters); }, [filters]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-xl font-semibold mb-4">Products</h1>
        <div className="grid gap-4 md:grid-cols-5">
          <div className="md:col-span-1">
            <select name="category" value={filters.category} onChange={onChange} className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input name="search" value={filters.search} onChange={onChange} placeholder="Search" className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500 md:col-span-2" />
          <input name="minPrice" value={filters.minPrice} onChange={onChange} placeholder="Min Price" type="number" className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
          <input name="maxPrice" value={filters.maxPrice} onChange={onChange} placeholder="Max Price" type="number" className="rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading products…</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map(p => <ProductCard key={p._id} product={p} />)}
          {!items.length && <div className="col-span-full text-center text-sm text-gray-500">No products found.</div>}
        </div>
      )}
      <div className="flex justify-center gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => load(i + 1, filters)}
            className={`px-3 py-1 rounded-lg text-sm border ${i + 1 === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-800'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
