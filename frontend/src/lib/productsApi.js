const PRODUCT_API_BASE = import.meta.env.VITE_PRODUCT_API_BASE || 'http://localhost:4002';

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, { credentials: 'include', ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const productsApi = {
  async list({ page = 1, limit = 12, category, search, minPrice, maxPrice } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    return fetchJson(`${PRODUCT_API_BASE}/api/products?${params.toString()}`);
  },
  async categories() {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/meta/categories`);
  },
  async get(id) {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}`);
  },
  async create({ title, description, price, categories, images, compareAtPrice, sku, brand, stock, tags, attributes }) {
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    form.append('price', price);
    if (categories?.length) form.append('categories', categories.join(','));
    if (compareAtPrice !== undefined && compareAtPrice !== '') form.append('compareAtPrice', compareAtPrice);
    if (sku !== undefined) form.append('sku', sku);
    if (brand !== undefined) form.append('brand', brand);
    if (stock !== undefined && stock !== '') form.append('stock', stock);
    if (Array.isArray(tags) && tags.length) form.append('tags', tags.join(','));
    if (attributes !== undefined) form.append('attributes', attributes);
    images?.forEach(f => form.append('images', f));
    return fetchJson(`${PRODUCT_API_BASE}/api/products`, { method: 'POST', body: form });
  },
  async update(id, { title, description, price, categories, images, compareAtPrice, sku, brand, stock, tags, attributes }) {
    const form = new FormData();
    if (title !== undefined) form.append('title', title);
    if (description !== undefined) form.append('description', description);
    if (price !== undefined) form.append('price', price);
    if (categories !== undefined) form.append('categories', categories.join(','));
    if (compareAtPrice !== undefined && compareAtPrice !== '') form.append('compareAtPrice', compareAtPrice);
    if (sku !== undefined) form.append('sku', sku);
    if (brand !== undefined) form.append('brand', brand);
    if (stock !== undefined && stock !== '') form.append('stock', stock);
    if (Array.isArray(tags)) form.append('tags', tags.join(','));
    if (attributes !== undefined) form.append('attributes', attributes);
    images?.forEach(f => form.append('images', f));
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}`, { method: 'PUT', body: form });
  },
  async remove(id) {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}`, { method: 'DELETE' });
  },
  async archive(id) {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}/archive`, { method: 'POST' });
  },
  async restore(id) {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}/restore`, { method: 'POST' });
  },
  async listArchived({ page = 1, limit = 12 } = {}) {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('limit', limit);
    return fetchJson(`${PRODUCT_API_BASE}/api/products/meta/archived?${params.toString()}`);
  },
  async removeImage(id, url) {
    return fetchJson(`${PRODUCT_API_BASE}/api/products/${id}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  },
};
