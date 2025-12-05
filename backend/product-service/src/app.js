import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import productRoutes from './routes/product.routes.js';
import { uploadsPath } from './middleware/upload.js';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Allow images to be embedded cross-origin from the frontend
app.use(helmet({
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === clientOrigin) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors({ origin: clientOrigin, credentials: true }));
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

// Static files for uploaded images
app.use('/uploads', express.static(uploadsPath));

// Friendly root response for external ingress
app.get('/', (_req, res) => res.json({ service: 'product', endpoints: ['/health', '/api/products'] }));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'product' }));
app.use('/api/products', productRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

export default app;
