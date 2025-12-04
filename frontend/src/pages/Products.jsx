import { useEffect, useMemo, useState } from 'react';
import { productsApi } from '../lib/productsApi.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Products() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', search: '', minPrice: '', maxPrice: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState('relevance');

  const load = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const data = await productsApi.list({ page: p, category: f.category || undefined, search: f.search || undefined, minPrice: f.minPrice || undefined, maxPrice: f.maxPrice || undefined });
      setItems(data.items || []);
      setPages(data.pages || 1);
      setPage(data.page || p);
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
        setCategories(data.categories || []);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => { load(1, filters); }, [filters]);

  // derive price bounds from current items
  const priceBounds = useMemo(() => {
    if (!items.length) return { min: 0, max: 1000 };
    const prices = items.map(i => Number(i.price || 0));
    const min = Math.min(...prices, 0);
    const max = Math.max(...prices, 1000);
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [items]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const applyCategory = (cat) => {
    setFilters(f => ({ ...f, category: cat }));
    setSidebarOpen(false);
  };

  const clearFilters = () => {
    setFilters({ category: '', search: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="full-bleed space-y-6">
      <div className="glass rounded-none p-6 border-y border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Products</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(s => !s)} className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              Filters
            </button>
            <button onClick={clearFilters} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition">
              Clear
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Sidebar */}
          <aside className={`md:col-span-1 transition-all ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
            <div className="space-y-4">
              <div className="flex items-center justify-end">
                <button onClick={clearFilters} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">Clear Filters</button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium mb-2">Categories</h3>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => applyCategory('')} className={`w-full text-sm px-2 py-1 rounded-md ${filters.category === '' ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>All Categories</button>
                  </li>
                  {categories.map(c => (
                    <li key={c}>
                      <button onClick={() => applyCategory(c)} className={`w-full text-left px-2 py-1 rounded-md ${filters.category === c ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>{c}</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium mb-2">Price</h3>
                <div className="text-xs text-gray-500 mb-2">Max: {filters.maxPrice || priceBounds.max}</div>
                <input type="range" name="maxPrice" min={priceBounds.min} max={priceBounds.max} value={filters.maxPrice || priceBounds.max} onChange={onChange} className="w-full" />
                <div className="mt-3 flex items-center gap-2">
                  <input name="minPrice" value={filters.minPrice} onChange={onChange} placeholder="Min" type="number" className="w-1/2 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2" />
                  <input name="maxPrice" value={filters.maxPrice} onChange={onChange} placeholder="Max" type="number" className="w-1/2 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2" />
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <h3 className="text-sm font-medium mb-2">Search</h3>
                <input name="search" value={filters.search} onChange={onChange} placeholder="Search products" className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2" />
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <div />
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500">Sort</label>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm px-3 py-2">
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-12 text-sm text-gray-500">Loading products…</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(() => {
                  const list = [...items];
                  if (sort === 'price-asc') list.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
                  if (sort === 'price-desc') list.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));
                  if (sort === 'newest') list.sort((a,b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
                  return list.map(p => <ProductCard key={p._id} product={p} />);
                })()}
                {!items.length && <div className="col-span-full text-center text-sm text-gray-500">No products found.</div>}
              </div>
            )}

            <div className="flex justify-center gap-2 mt-6">
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
        </div>
      </div>
    </div>
  );
}
