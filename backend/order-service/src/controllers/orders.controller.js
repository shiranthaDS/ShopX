import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  try {
    const {
      capture, shipping, summary, userId,
    } = req.body || {};
    if (!capture?.id) return res.status(400).json({ error: 'capture required' });

    const orderDoc = await Order.create({
      orderId: capture.id,
      status: capture.status || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.status,
      currency: capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code,
      totalPaid: Number(capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || 0),
      payer: capture?.payer || {},
      shipping: shipping || {},
      items: (summary?.cart?.items || []).map(it => ({
        productId: it?.product?._id || it?.productId || it?.id,
        title: it?.product?.title || it?.title,
        price: Number(it?.product?.price ?? it?.price ?? 0),
        quantity: Number((it?.qty ?? it?.quantity) || 1),
        total: Number(it?.total ?? ((Number(it?.product?.price ?? it?.price ?? 0)) * Number((it?.qty ?? it?.quantity) || 1))),
        imageUrl: it?.product?.images?.[0] || it?.imageUrl,
      })),
      cartSubtotal: Number(summary?.cart?.subtotal || 0),
      shippingFee: Number(summary?.shipping || 0),
      tax: Number(summary?.tax || 0),
      cartTotalLocal: Number(summary?.total || 0),
      localCurrency: summary?.currency || 'LKR',
      fxRate: Number(summary?.fxRate || 0),
      paypal: {
        id: capture?.id,
        status: capture?.status,
        capture: {
          id: capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          status: capture?.purchase_units?.[0]?.payments?.captures?.[0]?.status,
          amount: capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount,
        },
        raw: capture,
      },
      userId: userId || req.user?.id,
    });

    res.status(201).json(orderDoc);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to store order' });
  }
};

export const listOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to list orders' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Order.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to get order' });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, trackingNumber } = req.body || {};
    const allowed = ['awaiting_shipment', 'shipped', 'completed'];
    const update = {};
    if (deliveryStatus) {
      if (!allowed.includes(deliveryStatus)) return res.status(400).json({ error: 'Invalid deliveryStatus' });
      update.deliveryStatus = deliveryStatus;
    }
    if (typeof trackingNumber === 'string') update.trackingNumber = trackingNumber;
    const doc = await Order.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to update order' });
  }
};
