import { Cart } from '../models/Cart.js';

const ensureCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });
  return cart;
};

export const getCart = async (req, res) => {
  try {
    const cart = await ensureCart(req.user.id);
    return res.json({ cart });
  } catch (e) {
    console.error('getCart error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addItem = async (req, res) => {
  try {
    const { productId, title, price, image, qty = 1 } = req.body;
    if (!productId || price === undefined) return res.status(400).json({ message: 'productId and price required' });
    const cart = await ensureCart(req.user.id);
    const existing = cart.items.find(it => String(it.productId) === String(productId));
    if (existing) {
      existing.qty += Number(qty);
      existing.price = Number(price);
      existing.title = title ?? existing.title;
      existing.image = image ?? existing.image;
    } else {
      cart.items.push({ productId, title, price: Number(price), image, qty: Number(qty), total: 0 });
    }
    cart.recalc();
    await cart.save();
    return res.status(201).json({ cart });
  } catch (e) {
    console.error('addItem error', e);
    return res.status(400).json({ message: e.message || 'Invalid request' });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { productId, qty, price } = req.body;
    const cart = await ensureCart(req.user.id);
    const existing = cart.items.find(it => String(it.productId) === String(productId));
    if (!existing) return res.status(404).json({ message: 'Item not found' });
    if (qty !== undefined) existing.qty = Math.max(1, Number(qty));
    if (price !== undefined) existing.price = Number(price);
    cart.recalc();
    await cart.save();
    return res.json({ cart });
  } catch (e) {
    console.error('updateItem error', e);
    return res.status(400).json({ message: e.message || 'Invalid request' });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await ensureCart(req.user.id);
    const before = cart.items.length;
    cart.items = cart.items.filter(it => String(it.productId) !== String(productId));
    if (cart.items.length === before) return res.status(404).json({ message: 'Item not found' });
    cart.recalc();
    await cart.save();
    return res.json({ cart });
  } catch (e) {
    console.error('removeItem error', e);
    return res.status(400).json({ message: e.message || 'Invalid request' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const cart = await ensureCart(req.user.id);
    cart.items = [];
    cart.recalc();
    await cart.save();
    return res.json({ cart });
  } catch (e) {
    console.error('clearCart error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkoutSummary = async (req, res) => {
  try {
    const cart = await ensureCart(req.user.id);
    const shipping = cart.subtotal > 5000 ? 0 : 500; // simple example
    const tax = Math.round(cart.subtotal * 0.02 * 100) / 100;
    const total = cart.subtotal + shipping + tax;
    return res.json({ cart, shipping, tax, total, currency: cart.currency });
  } catch (e) {
    console.error('checkoutSummary error', e);
    return res.status(500).json({ message: 'Server error' });
  }
};
