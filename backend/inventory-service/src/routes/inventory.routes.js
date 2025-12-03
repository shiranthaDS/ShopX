import { Router } from 'express';
import auth from '../middleware/auth.js';
import { upsertItem, listItems, listLowStock, adjustStock, syncFromProducts } from '../controllers/inventory.controller.js';

const r = Router();

r.post('/', auth, upsertItem);
r.get('/', auth, listItems);
r.get('/low', auth, listLowStock);
r.post('/adjust', auth, adjustStock);
r.post('/sync', auth, syncFromProducts);

export default r;
