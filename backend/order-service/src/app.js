import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ordersRoutes from './routes/orders.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DBNAME || 'orders' })
  .then(() => console.log('order-service connected to MongoDB'))
  .catch(err => console.error('Mongo connection error', err));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'order-service' }));
app.use('/api/orders', ordersRoutes);

app.listen(PORT, () => {
  console.log(`order-service listening on http://localhost:${PORT}`);
});
