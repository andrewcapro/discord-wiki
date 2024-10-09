import connectToDatabase from "@/lib/mongodb";

export default async function getMembers(req: any, res: any) {
  if (req.method === "GET") {
    try {
      const client = await connectToDatabase();
      const database = client.db("HumpsWikiDB");
      const postsCollection = database.collection("posts");

      const members = await postsCollection.find({ isMember: true }).toArray();
      res.status(200).json(members);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
