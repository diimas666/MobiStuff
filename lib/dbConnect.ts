import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined in environment variables');
}

// Используем глобальный кэш, чтобы избежать повторных подключений в dev-режиме
interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & {
  mongoose: MongooseGlobal;
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

export default async function dbConnect() {
  const cached = globalWithMongoose.mongoose;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      // Не висіти хвилинами, якщо база недоступна
      serverSelectionTimeoutMS: 8000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Не кешуємо невдале підключення — наступний запит спробує ще раз
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}
