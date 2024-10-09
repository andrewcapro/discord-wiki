import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (!client) {
    try {
      client = new MongoClient(uri, {
        tls: true,
      });
      await client.connect();
      // console.log("Successfully connected to MongoDB.");
    } catch (error) {
      // console.error("Database connection failed:", error);
      throw error;
    }
  }
  return client;
}

export default connectToDatabase;
