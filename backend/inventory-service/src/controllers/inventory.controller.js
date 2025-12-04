import InventoryItem from '../models/InventoryItem.js';

const PRODUCT_API_BASE = process.env.PRODUCT_API_BASE || 'http://localhost:4002';

export const upsertItem = async (req, res) => {
  try {
    const { productId, title, sku, stock, lowStockThreshold, price, imageUrl, category } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'productId required' });
    const doc = await InventoryItem.findOneAndUpdate(
      { productId },
      { $set: { title, sku, price, imageUrl, category }, $setOnInsert: { stock: Number(stock ?? 0), lowStockThreshold: Number(lowStockThreshold ?? 5) } },
      { upsert: true, new: true }
    );
    res.status(201).json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upsert failed' });
  }
};

export const listItems = async (_req, res) => {
  try {
    const items = await InventoryItem.find().sort({ title: 1 });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message || 'List failed' });
  }
};

export const listLowStock = async (_req, res) => {
  try {
    const items = await InventoryItem.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }).sort({ stock: 1 });
    res.json({ items });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Low stock list failed' });
  }
};

export const adjustStock = async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items required' });
    const ops = items.map(it => ({
      updateOne: {
        filter: { productId: it.productId },
        update: { $inc: { stock: -Math.abs(Number(it.quantity || 0)) } },
        upsert: false,
      }
    }));
    if (ops.length) await InventoryItem.bulkWrite(ops);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Adjust failed' });
  }
};

export const syncFromProducts = async (_req, res) => {
  try {
    const resProd = await fetch(`${PRODUCT_API_BASE}/api/products`);
    if (!resProd.ok) return res.status(502).json({ error: `product-service ${resProd.status}` });
    const list = await resProd.json();
    const products = Array.isArray(list.items) ? list.items : (Array.isArray(list) ? list : []);
    const ops = products.map(p => ({
      updateOne: {
        filter: { productId: p._id },
        update: {
          $set: {
            title: p.title,
            sku: p.sku || p._id,
            price: Number(p.price || 0),
            imageUrl: (p.images && p.images[0]) || '',
            category: Array.isArray(p.categories) ? p.categories[0] : p.category,
          },
          $setOnInsert: { stock: Number(p.stock ?? 0), lowStockThreshold: Number(p.lowStockThreshold ?? 5) },
        },
        upsert: true,
      }
    }));
    if (ops.length) await InventoryItem.bulkWrite(ops);
    res.json({ ok: true, upserted: ops.length });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Sync failed' });
  }
};
