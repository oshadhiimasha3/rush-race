<<<<<<< Updated upstream
// import { MongoClient } from "mongodb";

// const uri = process.env.MONGODB_URI as string;

// if (!uri) {
//   throw new Error("Please add MONGODB_URI to .env.local");
// }

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;

// const globalWithMongo = global as typeof globalThis & {
//   _mongoClientPromise?: Promise<MongoClient>;
// };

// if (!globalWithMongo._mongoClientPromise) {
//   client = new MongoClient(uri);
//   globalWithMongo._mongoClientPromise = client.connect();
// }

// clientPromise = globalWithMongo._mongoClientPromise;

// export default clientPromise;
=======
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI in .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {

  if (cached.conn) {
    return cached.conn;
  }
>>>>>>> Stashed changes

  if (!cached.promise) {

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "rush-race",
      bufferCommands: false,
    });

<<<<<<< Updated upstream
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(MONGODB_URI);
=======
  }

  cached.conn = await cached.promise;

  return cached.conn;
>>>>>>> Stashed changes
}