import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DBNAME || 'auth';
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri, { dbName });
  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected (db: ${dbName})`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};
