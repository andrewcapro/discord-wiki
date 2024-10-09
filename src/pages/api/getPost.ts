import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../lib/mongodb"; // Adjust the import path as necessary
import { Post } from "@/types/types"; // Adjust the path as necessary

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { title },
  } = req;

  if (req.method === "GET") {
    try {
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Invalid title format" });
      }

      let decodedTitle;
      try {
        decodedTitle = decodeURIComponent(title);
      } catch (error) {
        console.error("Error decoding title:", error);
        return res.status(400).json({ error: "Invalid title format" });
      }

      const client = await connectToDatabase();
      const database = client.db("HumpsWikiDB");
      const postsCollection = database.collection<Post>("posts");

      const post = await postsCollection.findOne({ postTitle: decodedTitle });
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      res.status(200).json(post);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
