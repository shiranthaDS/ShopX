import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import paypalRoutes from './routes/paypal.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4004;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => res.json({ service: 'payment', endpoints: ['/api/health', '/api/paypal'] }));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'payment-service' }));

app.use('/api/paypal', paypalRoutes);

app.listen(PORT, () => {
  console.log(`payment-service listening on http://localhost:${PORT}`);
});
