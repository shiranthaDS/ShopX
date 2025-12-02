import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import { createPaypalOrder, capturePaypalOrder, getConfig } from '../controllers/paypal.controller.js';

const router = Router();

// Client ID is safe to expose; keep order endpoints protected
router.get('/config', getConfig);
router.post('/create-order', requireUser, createPaypalOrder);
router.post('/capture-order', requireUser, capturePaypalOrder);

export default router;
