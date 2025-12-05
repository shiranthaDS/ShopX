import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: clientOrigin,
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow same-origin requests or the configured origin
      if (!origin || origin === clientOrigin) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Handle preflight for all routes
app.options('*', cors({ origin: clientOrigin, credentials: true }));
    credentials: true,
  })
);

// Friendly root response for external ingress
app.get('/', (_req, res) => {
  res.json({ service: 'auth', endpoints: ['/health', '/api/auth'] });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

app.use('/api/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

export default app;
