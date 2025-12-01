import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DBNAME || 'product';
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { dbName });
  mongoose.connection.on('connected', () => console.log(`Product DB connected (${dbName})`));
  mongoose.connection.on('error', err => console.error('Product DB error', err));
};
