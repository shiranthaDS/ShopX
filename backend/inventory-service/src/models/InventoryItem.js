import mongoose from 'mongoose';

const InventoryItemSchema = new mongoose.Schema({
  productId: { type: String, index: true },
  title: String,
  sku: String,
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  price: Number,
  imageUrl: String,
  category: String,
}, { timestamps: true });

export default mongoose.model('InventoryItem', InventoryItemSchema);
