import Link from "next/link";
import Navbar from "../navbar/component";
import { useEffect, useState } from "react";
import { Post } from "@/types/types";
import Loading from "../loading";

const sanitizeText = (text: string): string => {
  return text.replace(/\{\{(.+?)\}\}/g, "$1"); // Removes the {{ }} from the text
};

export default function Members() {
  const [members, setMembers] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/getMembers");
        if (!response.ok) {
          throw new Error("Failed to fetch members");
        }
        const data = await response.json();
        setMembers(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-6xl text-white mx-auto p-6">
        <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">
          Meet The Members
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <Link key={index} href={`/posts/${member.postTitle}`}>
              <div className="bg-white shadow-md rounded-lg p-4 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center h-full">
                <img
                  src={member.imageURL}
                  alt={member.postTitle}
                  width={128}
                  height={128}
                  className="rounded-full mb-4 object-cover w-32 h-32"
                />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
                  {member.postTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                  {member.sections.length > 0
                    ? sanitizeText(member.sections[0].body)
                    : "No description available."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
