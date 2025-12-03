import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createOrder, listOrders, getOrder, updateOrder } from '../controllers/orders.controller.js';

const r = Router();

r.post('/', auth, createOrder);
r.get('/', auth, listOrders);
r.get('/:id', auth, getOrder);
r.put('/:id', auth, updateOrder);

export default r;
