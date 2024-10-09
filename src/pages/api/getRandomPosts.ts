import connectToDatabase from "@/lib/mongodb";

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const client = await connectToDatabase(); // Use the existing connection
      const database = client.db("HumpsWikiDB");
      const postsCollection = database.collection("posts");

      // Fetch 3 random posts
      const randomPosts = await postsCollection
        .aggregate([{ $sample: { size: 3 } }])
        .toArray();

      res.status(200).json(randomPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
