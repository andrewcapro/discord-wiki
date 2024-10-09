import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../../navbar/component";
import { Post } from "@/types/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Loading from "@/pages/loading";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React from "react";

export default function Info() {
  const { userRole, userName, isAuthenticated } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { postTitle } = router.query;
  const postTitleString = Array.isArray(postTitle) ? postTitle[0] : postTitle;

  useEffect(() => {
    if (!isAuthenticated && router.pathname !== "/login") {
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("token");

    if (postTitleString) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const sanitizedTitle = postTitleString.replace(/%/g, "%25");
          const encodedTitle = encodeURIComponent(sanitizedTitle);

          const response = await fetch(`/api/getPost?title=${encodedTitle}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok || data.error) {
            setPost(null);
            return; // Exit early if there’s an error
          }

          setPost(data);
        } catch (error) {
          console.error("Error fetching post:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPost();
    }
  }, [postTitleString, isAuthenticated, router]);

  const handleEditPost = () => {
    if (post) {
      // Encode the post title for the URL
      const encodedTitle = encodeURIComponent(post.postTitle);
      router.push(`/editpost/${encodedTitle}`);
    }
  };

  const handleDeletePost = async () => {
    const confirmed = confirm("Are you sure you want to delete this post?");
    if (confirmed && post) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`/api/deletePost?id=${post._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to delete post");
        }
        alert("Post deleted successfully!");
        router.push("/posts");
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <>
        <Navbar />
        <p className="text-rose-500">{error}</p>
      </>
    );
  if (post === null)
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-4xl font-bold text-gray-800">Oops!</h1>
          <p className="mt-4 text-lg text-gray-600">No post found.</p>
          <p className="mt-2 text-md text-gray-500">
            It seems we couldn't find what you were looking for.
          </p>
          <Link
            href="/"
            className="mt-6 px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Return to Home
          </Link>
        </div>
      </>
    );

  const canEdit =
    (userRole === "contributor" && post.author === userName) ||
    userRole === "humper" ||
    userName === post.postTitle.trim().toLowerCase() ||
    userRole === "admin" ||
    (userName === "matt" && post.postTitle.trim().toLowerCase() === "randy");

  const canDelete =
    (userRole === "contributor" && post.author === userName) ||
    (userRole === "humper" && post.author === userName) ||
    userRole === "admin";

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg mt-8 border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            {post.postTitle}
          </h1>
          {canEdit && (
            <div className="flex items-center space-x-4">
              {canEdit && (
                <FontAwesomeIcon
                  icon={faPen}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  size="lg"
                  onClick={handleEditPost}
                />
              )}

              {canDelete && (
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-rose-600 hover:text-rose-800 cursor-pointer"
                  size="lg"
                  onClick={handleDeletePost}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row mb-4">
          <div className="flex-1 overflow-hidden">
            {post.sections.length > 0 &&
            post.sections.some(
              (section) => section.title.trim() || section.body.trim()
            ) ? (
              post.sections.map((section, index) => {
                if (section.title.trim() || section.body.trim()) {
                  const bodyWithLinks = section.body
                    .split(/(\{\{.+?\}\})/g)
                    .flatMap((part, i) => {
                      const lines = part.split("\n").map((line, j) => {
                        const match = line.match(/(^|[^{])\{\{(.+?)\}\}/);
                        if (match) {
                          const beforeLink = match[1]; // Capture the text before the link
                          const linkTitle = match[2];
                          return (
                            <>
                              {beforeLink}
                              <Link
                                key={`${i}-${j}`}
                                href={`/posts/${linkTitle}`}
                                className="text-blue-500 hover:underline"
                              >
                                {linkTitle}
                              </Link>
                            </>
                          );
                        }
                        return <span key={`${i}-${j}`}>{line}</span>;
                      });

                      return lines.map((line, j) => (
                        <React.Fragment key={`${i}-${j}`}>
                          {line}
                          {j < lines.length - 1 &&
                            !line.props?.children.startsWith("{{") && <br />}
                        </React.Fragment>
                      ));
                    });

                  return (
                    <div key={index} className="mb-4 flex">
                      {section.imageURL && (
                        <div className="flex-shrink-0 mr-4">
                          <img
                            src={section.imageURL}
                            alt={`Image for ${section.title}`}
                            className="w-32 h-32 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2 dark:text-gray-200">
                          {section.title}
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4 dark:text-gray-300 break-words">
                          {bodyWithLinks}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })
            ) : (
              <p>No sections available.</p>
            )}
          </div>

          <div className="flex-shrink-0 w-1/3 ml-4">
            {post.imageURL && (
              <div className="relative w-48 h-48 mx-auto overflow-hidden">
                <img
                  src={post.imageURL}
                  alt="Post Image"
                  className="w-full h-full object-cover rounded"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
            )}

            <div className="mt-2 text-gray-600 text-sm dark:text-gray-400">
              {post.details.length > 0 &&
              post.details.some(
                (detail) => detail.title.trim() || detail.body.trim()
              ) ? (
                post.details.map((detail, index) => {
                  if (detail.title.trim() || detail.body.trim()) {
                    const bodyWithLinks = detail.body
                      .split(/(\{\{.+?\}\})/g)
                      .flatMap((part, i) => {
                        const lines = part.split("\n").map((line, j) => {
                          const match = line.match(/^\{\{(.+?)\}\}$/);
                          if (match) {
                            const linkTitle = match[1];
                            return (
                              <Link
                                key={`${index}-${i}-${j}`}
                                href={`/posts/${linkTitle}`}
                                className="text-blue-500 hover:underline"
                              >
                                {linkTitle}
                              </Link>
                            );
                          }
                          return <span key={`${index}-${i}-${j}`}>{line}</span>;
                        });

                        return lines.map((line, j) => (
                          <React.Fragment key={`${index}-${i}-${j}`}>
                            {line}
                            {j < lines.length - 1 &&
                              !line.props?.children.startsWith("{{") && <br />}
                          </React.Fragment>
                        ));
                      });

                    return (
                      <p className="text-center" key={index}>
                        <span className="font-bold">{detail.title}:</span>{" "}
                        {bodyWithLinks}
                      </p>
                    );
                  }
                  return null;
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-300 dark:border-gray-700 pt-4 mt-6 flex justify-center space-x-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-bold">Author:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {post.author}
            </span>
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <span className="font-bold">Created:</span>{" "}
            <span className="text-gray-600 dark:text-gray-300">
              {new Date(post.createdDate).toLocaleDateString()}
            </span>
          </p>
          {post.modifiedDate && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-bold">Modified:</span>{" "}
              <span className="text-gray-600 dark:text-gray-300">
                {new Date(post.modifiedDate).toLocaleDateString()}
              </span>
            </p>
          )}
          {post.modifiedAuthor && post.modifiedAuthor.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              <span className="font-bold">Modified By:</span>{" "}
              <span className="text-gray-600 dark:text-gray-300">
                {post.modifiedAuthor}
              </span>
            </p>
          )}
        </div>

        <footer className="text-center text-gray-500 text-sm mt-4 dark:text-gray-400">
          © 2024 Humps Wiki. All rights reserved.
        </footer>
      </div>
    </>
  );
}
