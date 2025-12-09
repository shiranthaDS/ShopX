import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../lib/productsApi.js';
import { formatMoney } from '../lib/money.js';
import { useCart } from '../context/CartContext.jsx';
import { flyToCart } from '../lib/anim.js';

// Hardcoded ACA product-service external URL
const PRODUCT_API_BASE = 'https://product-service.ambitiousbush-23a76182.uaenorth.azurecontainerapps.io';
const resolveImageUrl = (raw) => {
  const base = (PRODUCT_API_BASE || '').replace(/\/$/, '');
  const url = String(raw || '').trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  // Ensure exactly one leading slash and strip accidental double /uploads
  const path = `/${url}`.replace(/\/+/g, '/');
  return `${base}${path}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const { add: addToCart } = useCart();
  const mainImgRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productsApi
      .get(id)
      .then((d) => {
        if (!mounted) return;
        setProduct(d.product);
        setIdx(0);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || 'Not found');
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const images = useMemo(() => {
    const arr = Array.isArray(product?.images) ? product.images : [];
    // Normalize and de-duplicate
    const normalized = arr.map((u) => resolveImageUrl(u));
    return Array.from(new Set(normalized));
  }, [product]);
  const showPrev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const showNext = () => setIdx((i) => (i + 1) % images.length);

  if (loading) return <div className="text-sm text-gray-500">Loading…</div>;
  if (error || !product) return (
    <div className="text-center py-16">
      <p className="mb-4 text-sm text-gray-500">{error || 'Not found'}</p>
      <button onClick={() => navigate(-1)} className="text-sm underline">Go back</button>
    </div>
  );

  const hasCompare = typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price;

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const bumpCartBadge = () => {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.classList.remove('cart-badge-bump');
    void badge.offsetWidth;
    badge.classList.add('cart-badge-bump');
    const cleanup = () => badge.classList.remove('cart-badge-bump');
    badge.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 700);
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-2">
        <Link to="/products" className="hover:underline">Products</Link>
        <span>/</span>
        <span className="truncate max-w-[50%]" title={product.title}>{product.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Gallery */}
        <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 max-h-[420px]">
          {images.length ? (
            <img
              ref={mainImgRef}
              key={idx}
              src={resolveImageUrl(images[idx])}
              alt={`${product.title} image ${idx + 1}`}
              className="h-full w-full object-cover"
              crossOrigin="anonymous"
              loading="eager"
              onError={(e) => {
                // Fallback attempt: if absolute fails and original was absolute, hide; else try prefixing base
                const current = e.currentTarget.src;
                const raw = images[idx];
                const abs = resolveImageUrl(raw);
                if (current !== abs) {
                  e.currentTarget.src = abs;
                } else {
                  e.currentTarget.style.opacity = '0';
                  e.currentTarget.alt = 'Image unavailable';
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">No Image</div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={showPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-800 dark:text-gray-200 grid place-items-center hover:bg-white"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={showNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-800 dark:text-gray-200 grid place-items-center hover:bg-white"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
        </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-6 sm:grid-cols-8 gap-2">
              {images.map((u, i) => (
                <button
                  key={u + i}
                  onClick={() => setIdx(i)}
                  className={`aspect-square rounded-md overflow-hidden ring-1 ${i === idx ? 'ring-indigo-500' : 'ring-gray-200 dark:ring-gray-700'}`}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img
                    src={resolveImageUrl(u)}
                    alt="thumb"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const abs = resolveImageUrl(u);
                      if (e.currentTarget.src !== abs) e.currentTarget.src = abs;
                      else e.currentTarget.style.visibility = 'hidden';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <h1 className="text-lg font-semibold leading-tight">{product.title}</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {product.brand && <span className="px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">{product.brand}</span>}
              {product.sku && <span className="px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">SKU: {product.sku}</span>}
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-xl font-semibold text-indigo-600">{formatMoney(product.price)}</span>
              {hasCompare && (
                <>
                  <span className="text-xs line-through text-gray-400">{formatMoney(product.compareAtPrice)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">Save {formatMoney(Number(product.compareAtPrice) - Number(product.price))}</span>
                </>
              )}
            </div>
            {typeof product.stock === 'number' && (
              <p className={`mt-1 text-xs ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </p>
            )}
            {Array.isArray(product.categories) && product.categories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {product.categories.map((c) => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">{c}</span>
                ))}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button onClick={dec} className="px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Decrease quantity">−</button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  className="w-12 text-center text-sm bg-transparent focus:outline-none"
                />
                <button onClick={inc} className="px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Increase quantity">+</button>
              </div>
              <button
                disabled={product.stock <= 0}
                onClick={async () => {
                  try {
                    flyToCart(mainImgRef.current);
                    bumpCartBadge();
                    await addToCart({ productId: product._id, title: product.title, price: product.price, image: images[0], qty });
                  } catch (e) { alert(e.message); }
                }}
                className="flex-1 rounded-md px-4 py-2 text-sm bg-gray-900 text-white hover:bg-black disabled:opacity-50"
              >Add to Cart</button>
              <button
                disabled={product.stock <= 0}
                onClick={async () => {
                  try {
                    flyToCart(mainImgRef.current);
                    bumpCartBadge();
                    await addToCart({ productId: product._id, title: product.title, price: product.price, image: images[0], qty });
                    navigate('/cart');
                  } catch (e) { alert(e.message); }
                }}
                className="rounded-md px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >Buy Now</button>
            </div>

            {/* Trust indicators */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2">✓ Free returns within 30 days</div>
              <div className="rounded-md border border-gray-200 dark:border-gray-700 p-2">✓ Secure checkout</div>
            </div>
          </div>

          {/* Collapsible sections */}
          {product.description && (
            <details className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4" open>
              <summary className="cursor-pointer text-sm font-medium">Description</summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{product.description}</div>
            </details>
          )}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <details className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <summary className="cursor-pointer text-sm font-medium">Specifications</summary>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 py-2">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="text-xs text-gray-500">
            <Link to="/products" className="hover:underline">Back to products</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
