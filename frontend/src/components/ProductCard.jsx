const PRODUCT_API_BASE = import.meta.env.VITE_PRODUCT_API_BASE || 'http://localhost:4002';
const resolveImageUrl = (url) => {
  if (!url) return '';
  const isAbsolute = /^https?:\/\//i.test(url);
  if (isAbsolute) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return PRODUCT_API_BASE + normalized;
};

import { Link } from 'react-router-dom';
import { formatMoney } from '../lib/money.js';

export default function ProductCard({ product }) {
  return (
    <div className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex flex-col shadow-sm hover:shadow-md transition">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          {product.images?.length ? (
            <img
              src={resolveImageUrl(product.images[0])}
              alt={product.title}
              className="h-full w-full object-cover group-hover:scale-105 transition"
              loading="lazy"
              decoding="async"
              crossOrigin="anonymous"
              onError={(e) => {
                const url = product.images[0];
                const abs = resolveImageUrl(url);
                if (e.currentTarget.src !== abs) {
                  e.currentTarget.src = abs;
                } else {
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
          )}
        </div>
        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{product.description}</p>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="font-medium text-indigo-600">{formatMoney(product.price)}</span>
        {product.categories?.length && (
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
            {product.categories[0]}
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link to={`/products/${product._id}`} className="text-center text-xs rounded-md px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-700">Buy Now</Link>
        <Link to={`/products/${product._id}`} className="text-center text-xs rounded-md px-3 py-2 bg-gray-900 text-white hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600">Add to Cart</Link>
      </div>
    </div>
  );
}
