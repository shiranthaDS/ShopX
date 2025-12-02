import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: String,
  price: { type: Number, required: true },
  image: String,
  qty: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  items: { type: [itemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  currency: { type: String, default: 'LKR' },
}, { timestamps: true });

cartSchema.methods.recalc = function () {
  this.items.forEach(it => { it.total = Number(it.price) * Number(it.qty); });
  this.subtotal = this.items.reduce((s, it) => s + it.total, 0);
};

export const Cart = mongoose.model('Cart', cartSchema);
