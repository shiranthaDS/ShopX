import { Router } from 'express';
import { addItem, updateItem, removeItem, getCart, clearCart, checkoutSummary } from '../controllers/cart.controller.js';

const router = Router();

router.get('/', getCart);
router.post('/add', addItem);
router.post('/update', updateItem);
router.post('/remove', removeItem);
router.post('/clear', clearCart);
router.get('/checkout', checkoutSummary);

export default router;
