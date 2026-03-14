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



import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(MONGODB_URI);
}