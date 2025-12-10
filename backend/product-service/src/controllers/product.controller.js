import { Product } from '../models/Product.js';
import { publicImageUrl, uploadsPath } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

// Helper to fix old internal URLs in product images
const fixImageUrls = (product) => {
  if (!product || !product.images) return product;
  const publicBase = process.env.PUBLIC_BASE_URL || '';
  const fixed = { ...product.toObject ? product.toObject() : product };
  fixed.images = fixed.images.map(url => {
    if (!url) return url;
    // Replace .internal. with external domain
    if (url.includes('.internal.')) {
      const pathPart = url.split('/uploads/')[1];
      if (pathPart && publicBase) {
        return `${publicBase}/uploads/${pathPart}`;
      }
    }
    return url;
  });
  return fixed;
};

export const createProduct = async (req, res) => {
  try {
    const files = req.files || [];
    const images = files.map(f => publicImageUrl(f.filename));
    const { title, description, price, categories, compareAtPrice, sku, brand, stock, tags, attributes } = req.body;
    const catArray = Array.isArray(categories)
      ? categories
      : typeof categories === 'string' && categories.length
      ? categories.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string' && tags.length
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];
    const attrObj = (() => {
      if (typeof attributes === 'string' && attributes) {
        try { return JSON.parse(attributes); } catch { return {}; }
      }
      if (typeof attributes === 'object' && attributes) return attributes;
      return {};
    })();
    const product = await Product.create({
      title,
      description,
      price,
      compareAtPrice,
      sku,
      brand,
      stock,
      tags: tagArray,
      categories: catArray,
      attributes: attrObj,
      images,
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, minPrice, maxPrice } = req.query;
    const filter = { active: true };
    if (category) filter.categories = category;
    if (minPrice) filter.price = { ...(filter.price || {}), $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: parseFloat(maxPrice) };
    let query = Product.find(filter);
    if (search) {
      query = query.find({ $text: { $search: search } });
    }
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      query.sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Product.countDocuments(filter),
    ]);
    const fixedItems = items.map(fixImageUrls);
    res.json({ items: fixedItems, total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listCategories = async (_req, res) => {
  try {
    const categories = await Product.distinct('categories', { active: true });
    res.json({ categories: categories.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product || !product.active) return res.status(404).json({ message: 'Not found' });
    const fixed = fixImageUrls(product);
    res.json({ product: fixed });
  } catch (err) {
    res.status(404).json({ message: 'Not found' });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    const { title, description, price, categories, compareAtPrice, sku, brand, stock, tags, attributes } = req.body;
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (sku !== undefined) product.sku = sku;
    if (brand !== undefined) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (categories !== undefined) {
      product.categories = Array.isArray(categories)
        ? categories
        : typeof categories === 'string'
        ? categories.split(',').map(c => c.trim()).filter(Boolean)
        : product.categories;
    }
    if (tags !== undefined) {
      product.tags = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : product.tags;
    }
    if (attributes !== undefined) {
      product.attributes = (() => {
        if (typeof attributes === 'string' && attributes) {
          try { return JSON.parse(attributes); } catch { return product.attributes; }
        }
        if (typeof attributes === 'object' && attributes) return attributes;
        return product.attributes;
      })();
    }
    // If new files uploaded, append
    if (req.files?.length) {
      const images = req.files.map(f => publicImageUrl(f.filename));
      product.images = [...product.images, ...images];
    }
    await product.save();
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    // Attempt to delete image files from disk
    const base = process.env.PUBLIC_BASE_URL || '';
    for (const u of product.images || []) {
      try {
        const rel = base && u.startsWith(base) ? u.slice(base.length) : u;
        const filename = rel.replace(/^\/?uploads\//, '');
        const filePath = path.join(uploadsPath, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
    await Product.deleteOne({ _id: id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const archiveProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const restoreProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, { active: true }, { new: true });
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listArchivedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const filter = { active: false };
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Product.countDocuments(filter),
    ]);
    res.json({ items, total, page: parseInt(page, 10), pages: Math.ceil(total / parseInt(limit, 10)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeProductImage = async (req, res) => {
  const { id } = req.params;
  const { url } = req.body; // full or relative url
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    if (!url) return res.status(400).json({ message: 'Image url required' });
    const normalized = (u) => {
      try {
        // strip base if absolute
        const base = process.env.PUBLIC_BASE_URL || '';
        if (base && u.startsWith(base)) return u.slice(base.length);
      } catch {}
      return u;
    };
    const target = normalized(url);
    const before = product.images.length;
    product.images = product.images.filter((u) => normalized(u) !== target);
    if (product.images.length === before) return res.status(404).json({ message: 'Image not found' });
    await product.save();
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
