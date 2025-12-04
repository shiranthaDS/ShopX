import { useEffect, useMemo, useRef, useState } from 'react';
import { productsApi } from '../lib/productsApi.js';
import ProductCard from '../components/ProductCard.jsx';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1400&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515165562835-c3b8c6ae5ee1?q=80&w=1400&auto=format&fit=crop',
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await productsApi.list({ page: 1 });
        setProducts(data.items?.slice(0, 8) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const cur = HERO_IMAGES[index];
  const next = HERO_IMAGES[(index + 1) % HERO_IMAGES.length];

  return (
    <div className="space-y-16">
      <section
        className="full-bleed relative overflow-hidden border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-none flex items-center"
        style={{ minHeight: 'calc(100vh - 72px)' }}
      >
        <div className="absolute inset-0">
          <img key={cur} src={cur} alt="" className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-16 lg:p-24 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">Shop smarter. Live better.</h1>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-white/90">Discover curated products with fast checkout, secure payments, and delightful delivery. Welcome to the modern shopping experience.</p>
            <div className="mt-6 flex gap-3">
              <a href="/products" className="inline-flex items-center gap-2 rounded-lg bg-white text-gray-900 px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition">
                Explore products
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M5 12h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
              </a>
              <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-white/80 text-white px-4 py-2 text-sm hover:bg-white/10 transition">Why ShopX</a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <div key={i} className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-gray-900 p-6 group hover:shadow-md transition">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white grid place-items-center shadow group-hover:scale-105 transition">
              {f.icon}
            </div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Featured products</h2>
          <a href="/products" className="text-xs underline">View all</a>
        </div>
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500">Loading products…</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      <footer className="full-bleed border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-sm text-gray-600 dark:text-gray-400 rounded-none">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <span className="inline-flex h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-rose-600 text-white items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
              </span>
              <span className="font-semibold">ShopX</span>
            </div>
            <p className="mt-2 text-xs">Modern commerce, crafted with care. Secure payments, quick delivery, and products you’ll love.</p>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Links</div>
            <ul className="mt-2 space-y-1">
              <li><a className="hover:underline" href="/products">Products</a></li>
              <li><a className="hover:underline" href="#features">Features</a></li>
              <li><a className="hover:underline" href="/cart">Cart</a></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Stay updated</div>
            <p className="mt-2 text-xs">Join our newsletter for product drops and offers.</p>
            <form className="mt-3 flex gap-2">
              <input type="email" placeholder="you@example.com" className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm" />
              <button className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4 text-xs">© {new Date().getFullYear()} ShopX. All rights reserved.</div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Fast checkout',
    desc: 'Pay securely with PayPal and breeze through checkout.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-5a1 1 0 00-1 1v3H8a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V8a1 1 0 00-1-1z"/>
      </svg>
    )
  },
  {
    title: 'Curated catalog',
    desc: 'Beautiful products, carefully selected and frequently refreshed.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 6a2 2 0 012-2h4v16H6a2 2 0 01-2-2V6zm14-2h-4v16h4a2 2 0 002-2V6a2 2 0 00-2-2z"/>
      </svg>
    )
  },
  {
    title: 'Fast delivery',
    desc: 'Reliable shipping with tracking from door to door.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M3 7a2 2 0 012-2h9a2 2 0 012 2v3h2.586A2 2 0 0119 12.414l-2 2A2 2 0 0115.586 15H16v1a2 2 0 01-2 2h-1a3 3 0 11-6 0H6a2 2 0 01-2-2V7z"/>
      </svg>
    )
  },
];
