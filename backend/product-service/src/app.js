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

app.use(helmet());
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

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'product' }));
app.use('/api/products', productRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

export default app;
