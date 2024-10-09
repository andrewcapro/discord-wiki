import { Post } from "@/types/types";
import Navbar from "../navbar/component";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSearch, faPen } from "@fortawesome/free-solid-svg-icons";
import { ObjectId } from "mongodb";
import Loading from "../loading";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const truncateText = (text: string, charLimit: number): string => {
  return text.length <= charLimit ? text : `${text.slice(0, charLimit)}...`;
};

export default function Posts() {
  const { userName, userRole } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortOrder, setSortOrder] = useState(true);
  const [sortBy, setSortBy] = useState<"title" | "created" | "modified">(
    "created"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/getPosts");
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data);
        setFilteredPosts(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Sorting logic
  const getSortedPosts = () => {
    return [...filteredPosts].sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder
          ? a.postTitle.localeCompare(b.postTitle)
          : b.postTitle.localeCompare(a.postTitle);
      } else if (sortBy === "modified") {
        return sortOrder
          ? new Date(b.modifiedDate).getTime() -
              new Date(a.modifiedDate).getTime() // Change to b - a for descending
          : new Date(a.modifiedDate).getTime() -
              new Date(b.modifiedDate).getTime(); // Change to a - b for ascending
      } else {
        return sortOrder
          ? new Date(b.createdDate).getTime() -
              new Date(a.createdDate).getTime() // Change to b - a for descending
          : new Date(a.createdDate).getTime() -
              new Date(b.createdDate).getTime(); // Change to a - b for ascending
      }
    });
  };

  const handleDelete = async (postId: ObjectId) => {
    if (confirm("Are you sure you want to delete this post?")) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`/api/deletePost?id=${postId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to delete post");
        setFilteredPosts((prevPosts) =>
          prevPosts.filter((post) => post._id.toString() !== postId.toString())
        );
        setSuccessMessage("Post deleted successfully!");
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const handleSort = (
    sortAsc: boolean,
    criteria: "title" | "created" | "modified"
  ) => {
    setSortOrder(sortAsc);
    setSortBy(criteria);
  };

  const handleSearch = () => {
    const results = posts.filter((post) =>
      post.postTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(results);
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = getSortedPosts().slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) return <Loading />;

  const canEditPost = (post: Post) => {
    return (
      (userRole === "contributor" && post.author === userName) ||
      userRole === "humper" ||
      userRole === "admin" ||
      (userName === "matt" && post.postTitle.trim().toLowerCase() === "randy")
    );
  };

  const canDeletePost = (post: Post) => {
    return (
      (userRole === "contributor" && post.author === userName) ||
      (userRole === "humper" && post.author === userName) ||
      userRole === "admin"
    );
  };

  const sortCriteria: Array<"title" | "modified" | "created"> = [
    "title",
    "modified",
    "created",
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-center text-white mb-8 dark:text-white">
          Posts
        </h1>

        {successMessage && (
          <div className="bg-green-500 text-white p-3 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-rose-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4 flex border border-gray-300 rounded focus-within:ring-2 focus-within:ring-blue-600 dark:border-gray-600 dark:bg-gray-800">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="px-4 py-2 w-full text-gray-900 bg-white dark:bg-gray-800 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white rounded-r px-4 flex items-center"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <div className="flex justify-end mb-4">
          {sortCriteria.map((criteria) => (
            <button
              key={criteria}
              onClick={() =>
                handleSort(sortBy === criteria ? !sortOrder : true, criteria)
              }
              className={`mx-1 px-3 py-1 rounded ${
                sortBy === criteria
                  ? sortOrder
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-800"
                  : "bg-gray-300 text-gray-800"
              } hover:bg-blue-400`}
            >
              Sort By {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {currentPosts.map((post) => (
            <div
              key={post._id.toString()}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
            >
              <Link
                className="flex flex-col mb-2"
                href={`posts/${encodeURIComponent(post.postTitle)}`}
              >
                <div className="flex items-start">
                  {post.imageURL ? (
                    <img
                      src={post.imageURL}
                      alt={post.postTitle}
                      className="w-20 h-20 mr-4 rounded"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="bg-white w-20 h-20 mr-4 rounded dark:bg-gray-800" />
                  )}
                  <div className="flex-1">
                    <div className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-left">
                      {post.postTitle}
                    </div>
                    <p
                      className="text-gray-600 dark:text-gray-400 text-left"
                      style={{
                        textIndent: "1.5em",
                        maxHeight: "3em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {post.sections.length > 0
                        ? truncateText(
                            post.sections[0].body.replace(
                              /\{\{(.+?)\}\}/g,
                              "$1"
                            ),
                            100
                          )
                        : "No body available."}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex justify-between items-center mt-4">
                <div className="mx-auto text-gray-500 dark:text-gray-400 text-sm text-center">
                  <span className="font-bold">Created on:</span>{" "}
                  {new Date(post.createdDate).toLocaleDateString()}{" "}
                  <span className="font-bold">Author:</span> {post.author}{" "}
                  {post.modifiedDate && (
                    <>
                      <span className="font-bold">Modified on:</span>{" "}
                      {new Date(post.modifiedDate).toLocaleDateString()}{" "}
                    </>
                  )}
                  {post.modifiedAuthor && (
                    <>
                      <span className="font-bold">Modified by:</span>{" "}
                      {post.modifiedAuthor}{" "}
                    </>
                  )}
                </div>

                {canEditPost(post) && (
                  <div className="flex items-center">
                    <Link
                      href={`/editpost/${encodeURIComponent(post.postTitle)}`}
                    >
                      <button
                        className="text-blue-600 hover:text-blue-800 mx-2"
                        aria-label="Edit post"
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>
                    </Link>
                    {canDeletePost(post) && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-rose-600 hover:text-rose-800"
                        aria-label="Delete post"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`mx-1 px-3 py-1 rounded-full ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-800"
              } hover:bg-blue-400`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
