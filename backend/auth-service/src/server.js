import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB } from './utils/db.js';

const PORT = process.env.PORT || 4001;

const start = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Auth Service running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Auth Service:', err);
    process.exit(1);
  }
};

start();
