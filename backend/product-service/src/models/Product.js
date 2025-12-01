import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    sku: { type: String, trim: true, unique: true, sparse: true },
    brand: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    categories: { type: [String], index: true, default: [] },
    images: { type: [String], default: [] }, // Stored as URL paths
    attributes: { type: Object, default: {} }, // e.g. { color: 'red', size: 'M' }
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
