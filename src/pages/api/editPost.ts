import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../../lib/mongodb";
import { MongoError } from "mongodb";
import { getUsernameFromToken, validateToken } from "@/functions/functions";

const MAX_TITLE_LENGTH = 75;
const MAX_SECTION_BODY_LENGTH = 1500;
const MAX_DETAIL_BODY_LENGTH = 1500;
const MAX_IMAGE_URL_LENGTH = 500;

const isValidTitle = (title: string) => {
  return title.length <= MAX_TITLE_LENGTH;
};

const isValidImageURL = (url: string) => {
  return url.length <= MAX_IMAGE_URL_LENGTH;
};

const isValidSection = (section: any) => {
  return (
    section.title.trim() !== "" &&
    section.body.trim() !== "" &&
    isValidTitle(section.title) &&
    section.body.length <= MAX_SECTION_BODY_LENGTH &&
    (section.imageURL === undefined || isValidImageURL(section.imageURL))
  );
};

const isValidDetail = (detail: any) => {
  return (
    isValidTitle(detail.title) && detail.body.length <= MAX_DETAIL_BODY_LENGTH
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { title } = req.query;

  if (req.method === "PUT") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided." });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Invalid title format" });
    }

    let decodedTitle;
    try {
      console.log(title);
      decodedTitle = decodeURIComponent(title);
    } catch (error) {
      console.error("Error decoding title:", error);
      return res.status(400).json({ error: "Invalid title format" });
    }

    try {
      await validateToken(token, ["contributor", "humper", "admin"]);
      const username = await getUsernameFromToken(token);
      const { postTitle, sections, details, imageURL } = req.body;

      // Validate post title and sections
      if (!postTitle || !sections || sections.length === 0) {
        return res.status(400).json({
          error: "Post Title and at least one Section are required.",
        });
      }

      // Validate post title
      if (!isValidTitle(postTitle)) {
        return res.status(400).json({
          error:
            "Post title must not exceed 75 characters and contain only alphanumeric characters and spaces.",
        });
      }

      // Validate sections
      for (const section of sections) {
        if (!isValidSection(section)) {
          return res.status(400).json({
            error:
              "Each section must have a title not exceeding 75 characters, a body not exceeding 1000 characters, and must not be empty.",
          });
        }
      }

      // Validate details
      if (details) {
        for (const detail of details) {
          if (!isValidDetail(detail)) {
            return res.status(400).json({
              error:
                "Each detail must have a title not exceeding 75 characters and a body not exceeding 1500 characters.",
            });
          }
        }
      }

      try {
        const client = await connectToDatabase();
        const database = client.db("HumpsWikiDB");
        const postsCollection = database.collection("posts");

        const updatedPost = {
          postTitle,
          sections,
          details,
          imageURL,
          modifiedAuthor: username,
          modifiedDate: new Date(),
        };

        const result = await postsCollection.updateOne(
          { postTitle: decodedTitle },
          { $set: updatedPost }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Post not found." });
        }

        res.status(200).json({ message: "Post updated successfully." });
      } catch (error) {
        console.error("Database error:", error);
        if (error instanceof MongoError && error.code === 11000) {
          return res.status(400).json({ error: "Post title must be unique" });
        }
        res.status(500).json({ error: "Failed to update post." });
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
