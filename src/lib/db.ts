import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Cache connection in global scope for ALL environments (including production/Netlify)
const cache: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cache;

export async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("[db] MongoDB URI is not defined. Available env keys:", Object.keys(process.env).filter(k => k.startsWith("MONGO") || k.startsWith("NEXT") || k.startsWith("JWT")));
    throw new Error("Please define MONGODB_URI or MONGO_URI in your environment");
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    // Reset promise on failure so next call retries
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
