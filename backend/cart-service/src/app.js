import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { requireUser } from './middleware/auth.js';
import cartRoutes from './routes/cart.routes.js';

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

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'cart' }));
app.use('/api/cart', requireUser, cartRoutes);

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

export default app;
