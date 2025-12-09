import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import app from './app.js';
import { connectDB } from './utils/db.js';

const PORT = process.env.PORT || 4002;

async function start() {
  try {
    await connectDB();
    http.createServer(app).listen(PORT, () => {
      console.log(`Product Service running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Product Service', err);
    process.exit(1);
  }
}

start();
