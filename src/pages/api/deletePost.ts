import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { validateToken } from "@/functions/functions";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
  } = req; // Extract id from query

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    await validateToken(token, ["contributor", "humper", "admin"]);

    if (req.method === "DELETE") {
      if (
        !id ||
        (Array.isArray(id) && id.length === 0) ||
        typeof id !== "string"
      ) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Convert id to ObjectId
      const objectId = new ObjectId(id);

      const client = await connectToDatabase();
      const database = client.db("HumpsWikiDB");
      const postsCollection = database.collection("posts");

      // Delete the post by ID
      const result = await postsCollection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
