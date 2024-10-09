import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "./navbar/component";
import { Post } from "@/types/types";
import Link from "next/link";
import Loading from "./loading";
import { useAuth } from "../context/AuthContext";

const removePlaceholders = (text: string) => {
  return text.replace(/\{\{(.+?)\}\}/g, "$1");
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [randomPosts, setRandomPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const connectToMongo = async () => {
    try {
      const response = await fetch("/api/connect");
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    connectToMongo();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/getRandomPosts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      // Process posts to remove placeholders
      const processedPosts = data.map((post: { sections: any[] }) => ({
        ...post,
        sections: post.sections.map((section: { body: any }) => ({
          ...section,
          body: removePlaceholders(section.body),
        })),
      }));
      setRandomPosts(processedPosts);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen text-white flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl font-bold mb-4">Welcome to the Humps Wiki</h1>
          <p className="text-lg mb-6">
            Discover everything you need to know about Humps! Explore events,
            people, and more.
          </p>
          <Link
            href="/members"
            className="mt-4 px-6 py-2 bg-blue-400 rounded-lg hover:bg-blue-700 transition"
          >
            Check out the Members
          </Link>
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">
              Check Out These Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {randomPosts.length > 0 ? (
                randomPosts.map((randomPost) => (
                  <Link
                    key={randomPost._id.toString()}
                    href={`/posts/${randomPost.postTitle}`}
                  >
                    <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 overflow-hidden w-64 h-48 cursor-pointer">
                      <h3 className="text-lg font-semibold mb-2">
                        {randomPost.postTitle}
                      </h3>
                      <p className="text-gray-300 mb-2 line-clamp-3">
                        {randomPost.sections[0].body}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-300">No articles found.</p>
              )}
            </div>
          </div>
        </main>
        <footer className="bg-gray-800 text-center p-4">
          <p className="text-sm text-gray-400">
            © 2024 Humps Wiki. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
