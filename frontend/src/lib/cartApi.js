const CART_API_BASE = import.meta.env.VITE_CART_API_BASE || 'http://localhost:4003';

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const cartApi = {
  async get() {
    return fetchJson(`${CART_API_BASE}/api/cart`);
  },
  async add({ productId, title, price, image, qty }) {
    return fetchJson(`${CART_API_BASE}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, title, price, image, qty }),
    });
  },
  async update({ productId, qty, price }) {
    return fetchJson(`${CART_API_BASE}/api/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty, price }),
    });
  },
  async remove({ productId }) {
    return fetchJson(`${CART_API_BASE}/api/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  },
  async clear() {
    return fetchJson(`${CART_API_BASE}/api/cart/clear`, { method: 'POST' });
  },
  async checkout() {
    return fetchJson(`${CART_API_BASE}/api/cart/checkout`);
  },
};
