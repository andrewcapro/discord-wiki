import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../lib/mongodb";
import jwt from "jsonwebtoken";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let { username, password } = req.body;
    if (typeof username === "string") {
      username = username.toLowerCase();
    }

    try {
      const client = await connectToDatabase();
      const db = client.db("HumpsWikiDB");

      // Find user by username
      const userDoc = await db.collection("users").findOne({ username });

      // Check if user exists and password matches
      if (
        !userDoc ||
        userDoc.password !== Buffer.from(password).toString("base64")
      ) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Create a JWT token
      const token = jwt.sign(
        { username: userDoc.username, role: userDoc.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      // Successful login
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
