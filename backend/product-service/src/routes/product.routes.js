import { Router } from 'express';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct, listCategories, removeProductImage, archiveProduct, restoreProduct, listArchivedProducts } from '../controllers/product.controller.js';

const router = Router();

// Public list & meta before dynamic id to avoid shadowing
router.get('/', optionalAuth, listProducts);
router.get('/meta/categories', optionalAuth, listCategories);
router.get('/meta/archived', requireAdmin, listArchivedProducts);
// Debug: inspect decoded token from cookie
router.get('/meta/token', (req, res) => {
  try {
    const token = req.cookies?.shopx_token;
    if (!token) return res.status(401).json({ message: 'No token' });
    // Inline verify to avoid import cycles
    const { verifyToken } = await import('../utils/jwt.js');
    const decoded = verifyToken(token);
    return res.json({ decoded });
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized', error: e?.message });
  }
});
router.get('/:id', optionalAuth, getProduct);

// Admin protected
router.post('/', requireAdmin, (req, res, next) => {
  uploadImages(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, createProduct);

router.put('/:id', requireAdmin, (req, res, next) => {
  uploadImages(req, res, function (err) {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, updateProduct);

router.delete('/:id', requireAdmin, deleteProduct);
router.delete('/:id/images', requireAdmin, removeProductImage);
router.post('/:id/archive', requireAdmin, archiveProduct);
router.post('/:id/restore', requireAdmin, restoreProduct);

export default router;
