import { createOrder, captureOrder, getPaypalClientId } from '../utils/paypal.js';
import fetch from 'node-fetch';

const CART_API_BASE = process.env.CART_API_BASE || 'http://localhost:4003';
const ORDER_API_BASE = process.env.ORDER_API_BASE || 'http://localhost:4005';
const INVENTORY_API_BASE = process.env.INVENTORY_API_BASE || 'http://localhost:4006';

async function getCartSummary(token) {
  const res = await fetch(`${CART_API_BASE}/api/cart/checkout`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to get cart summary');
  return res.json();
}

async function clearCart(token) {
  try {
    await fetch(`${CART_API_BASE}/api/cart/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {}
}

export const getConfig = async (_req, res) => {
  const currency = (process.env.CURRENCY_CODE || process.env.TARGET_CURRENCY || 'USD').toUpperCase();
  const localCurrency = (process.env.LOCAL_CURRENCY || 'LKR').toUpperCase();
  const fx = Number(process.env.FX_LKR_USD || 0);
  return res.json({ clientId: getPaypalClientId(), mode: process.env.PAYPAL_MODE || 'sandbox', currency, localCurrency, fxRate: fx });
};

export const createPaypalOrder = async (req, res) => {
  try {
    // Get summary from cart-service using user's token to prevent tampering
    const summary = await getCartSummary(req.authToken);
    const total = Number(summary?.total || summary?.subtotal || 0);
    if (!total || total <= 0) return res.status(400).json({ error: 'Cart is empty' });

    const targetCurrency = (process.env.CURRENCY_CODE || process.env.TARGET_CURRENCY || 'USD').toUpperCase();
    const localCurrency = (process.env.LOCAL_CURRENCY || 'LKR').toUpperCase();
    let amount = total;
    if (localCurrency === 'LKR' && targetCurrency === 'USD') {
      const fx = Number(process.env.FX_LKR_USD || 0);
      if (!fx || fx <= 0) return res.status(500).json({ error: 'FX rate not configured' });
      amount = Number(total) * fx;
    }
    const order = await createOrder({ amount, currency: targetCurrency });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Create order failed' });
  }
};

export const capturePaypalOrder = async (req, res) => {
  try {
    const { orderID } = req.body || {};
    if (!orderID) return res.status(400).json({ error: 'orderID required' });
    // Get summary BEFORE clearing cart so we preserve items
    const summary = await getCartSummary(req.authToken).catch(() => null);
    const data = await captureOrder(orderID);
    // Best-effort clear cart after successful capture
    await clearCart(req.authToken);
    // Persist order to order-service
    try {
      const shipping = req.body?.shipping || null;
      await fetch(`${ORDER_API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${req.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capture: data, shipping, summary }),
      });
    } catch (e) {
      console.error('Failed to persist order:', e?.message || e);
    }
    // Adjust inventory stock levels
    try {
      if (summary?.cart?.items?.length) {
        const items = summary.cart.items.map(it => ({
          productId: it?.product?._id || it?.productId || it?.id,
          quantity: Number((it?.qty ?? it?.quantity) || 1),
        }));
        await fetch(`${INVENTORY_API_BASE}/api/inventory/adjust`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${req.authToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      }
    } catch (e) {
      console.error('Failed to adjust inventory:', e?.message || e);
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Capture failed' });
  }
};
