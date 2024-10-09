import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI is not defined");
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async function handler(req: any, res: any) {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    res.status(200).json({ message: "Connected to MongoDB!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to connect to MongoDB." });
  } finally {
    await client.close();
  }
}
