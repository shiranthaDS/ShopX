import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './utils/db.js';

const port = process.env.PORT || 4003;

connectDB()
  .then(() => {
    app.listen(port, () => console.log(`Cart Service running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Failed to connect DB', err);
    process.exit(1);
  });
