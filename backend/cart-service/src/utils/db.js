import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DBNAME || 'cart';
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri, { dbName });
  console.log('Mongo connected:', dbName);
};
