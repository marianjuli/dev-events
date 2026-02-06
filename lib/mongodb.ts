import mongoose from "mongoose";

/**
 * Cached connection state to avoid creating multiple connections
 * (e.g. during Next.js hot reload in development).
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Extend the global object to include our mongoose cache.
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache on the global object to persist across hot reloads in development.
let cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Caches the connection to prevent multiple connections during development hot reloads.
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available.
  if (cached.conn) {
    return cached.conn;
  }

  // Create a new connection promise if one isn't in progress.
  if (!cached.promise) {
    if (!MONGODB_URI) {
      throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
      );
    }
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable Mongoose buffering.
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Allow retry on next call after a connection error.
    throw e;
  }

  return cached.conn;
}

export default connectDB;
