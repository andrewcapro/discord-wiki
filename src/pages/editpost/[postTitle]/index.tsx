import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "@/pages/navbar/component";
import { verifyStringLength } from "@/functions/functions";
import { useAuth } from "@/context/AuthContext";
import DOMPurify from "dompurify";

export default function EditPost() {
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const [sections, setSections] = useState([
    { title: "", body: "", imageURL: "" },
  ]);
  const [details, setDetails] = useState<
    Array<{ title: string; body: string }>
  >([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { postTitle } = router.query;
  const postTitleString = Array.isArray(postTitle) ? postTitle[0] : postTitle;

  useEffect(() => {
    if (postTitleString) {
      const fetchPostData = async () => {
        try {
          const sanitizedTitle = postTitleString.replace(/%/g, "%25");
          const encodedTitle = encodeURIComponent(sanitizedTitle);

          const response = await fetch(`/api/getPost?title=${encodedTitle}`);
          if (!response.ok) {
            throw new Error("Failed to fetch post");
          }
          const postData = await response.json();
          setTitle(postData.postTitle);
          setImageUrl(postData.imageURL);
          setSections(postData.sections);
          setDetails(postData.details);
        } catch (error: any) {
          setError(error.message);
        }
      };
      fetchPostData();
    }
  }, [postTitle]);

  const sanitizeInput = (input: string) => {
    return DOMPurify.sanitize(input);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Sanitize inputs
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedImageUrl = sanitizeInput(imageURL);
    const sanitizedSections = sections.map((section) => ({
      title: sanitizeInput(section.title),
      body: sanitizeInput(section.body),
      imageURL: sanitizeInput(section.imageURL),
    }));
    const sanitizedDetails = details.map((detail) => ({
      title: sanitizeInput(detail.title),
      body: sanitizeInput(detail.body),
    }));

    if (!verifyStringLength(sanitizedTitle, 75)) {
      setError("Post title must not exceed 75 characters.");
      return;
    }

    if (!verifyStringLength(sanitizedImageUrl, 250)) {
      setError("Image URL must not exceed 500 characters.");
      return;
    }

    for (const section of sanitizedSections) {
      if (!verifyStringLength(section.title, 75)) {
        setError("Section titles must not exceed 75 characters.");
        return;
      }
      if (!verifyStringLength(section.body, 1500)) {
        setError("Section bodies must not exceed 1500 characters.");
        return;
      }
      if (!verifyStringLength(section.imageURL, 250)) {
        setError("Section image URLs must not exceed 500 characters.");
        return;
      }
    }

    for (const detail of sanitizedDetails) {
      if (!verifyStringLength(detail.title, 75)) {
        setError("Detail titles must not exceed 75 characters.");
        return;
      }
      if (!verifyStringLength(detail.body, 1500)) {
        setError("Detail bodies must not exceed 1500 characters.");
        return;
      }
    }

    const postData = {
      postTitle: sanitizedTitle,
      sections: sanitizedSections,
      details: sanitizedDetails,
      imageURL: sanitizedImageUrl,
    };

    const token = localStorage.getItem("token");
    try {
      if (postTitleString) {
        const sanitizedTitle = postTitleString.replace(/%/g, "%25");
        const encodedTitle = encodeURIComponent(sanitizedTitle);

        const response = await fetch(`/api/editPost?title=${encodedTitle}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to edit post");
        }

        setSuccess("Post edited successfully!");
        router.push(`/posts/${encodeURIComponent(sanitizedTitle)}`);
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error editing post:", error);
    }
  };

  const handleCancel = () => {
    router.push(`/posts/${postTitle}`);
  };

  const handleAddSection = () => {
    setSections([...sections, { title: "", body: "", imageURL: "" }]);
  };

  const handleRemoveSection = (index: number) => {
    const editedSections = sections.filter((_, i) => i !== index);
    setSections(editedSections);
  };

  const handleSectionChange = (
    index: number,
    field: "title" | "body" | "imageURL",
    value: string
  ) => {
    const editedSections = sections.map((section, i) =>
      i === index ? { ...section, [field]: value } : section
    );
    setSections(editedSections);
  };

  const handleAddDetail = () => {
    setDetails([...details, { title: "", body: "" }]);
  };

  const handleRemoveDetail = (index: number) => {
    const editedDetails = details.filter((_, i) => i !== index);
    setDetails(editedDetails);
  };

  const handleDetailChange = (
    index: number,
    field: "title" | "body",
    value: string
  ) => {
    const editedDetails = details.map((detail, i) =>
      i === index ? { ...detail, [field]: value } : detail
    );
    setDetails(editedDetails);
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 bg-white shadow-md rounded-lg mt-8 border border-gray-300 dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4 dark:text-white">
          Edit Post
        </h1>

        {error && <div className="text-rose-500 mb-4">{error}</div>}
        {success && <div className="text-green-500 mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Post Title Input */}
          <div className="mb-4">
            <label
              className="block text-gray-800 mb-2 dark:text-gray-200"
              htmlFor="title"
            >
              Post Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Left Column for Sections */}
            <div className="flex-1 mb-4 md:mr-4 flex flex-col">
              {/* Dynamically Generated Sections */}
              {sections.map((section, index) => (
                <div key={index} className="mb-4 border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Section {index + 1}
                    </h2>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(index)}
                        className="bg-rose-600 text-white px-2 py-1 rounded hover:bg-rose-900"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mb-2">
                    <label
                      className="block text-gray-800 mb-1 dark:text-gray-200"
                      htmlFor={`section-title-${index}`}
                    >
                      Section Title
                    </label>
                    <input
                      type="text"
                      id={`section-title-${index}`}
                      value={section.title}
                      onChange={(e) =>
                        handleSectionChange(index, "title", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Enter section title"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      className="block text-gray-800 mb-1 dark:text-gray-200"
                      htmlFor={`section-body-${index}`}
                    >
                      Section Body
                    </label>
                    <textarea
                      id={`section-body-${index}`}
                      value={section.body}
                      onChange={(e) =>
                        handleSectionChange(index, "body", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      rows={4}
                      placeholder="Enter section body"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      className="block text-gray-800 mb-1 dark:text-gray-200"
                      htmlFor={`section-imageURL-${index}`}
                    >
                      Section Image URL
                    </label>
                    <input
                      type="url"
                      id={`section-imageURL-${index}`}
                      value={section.imageURL}
                      onChange={(e) =>
                        handleSectionChange(index, "imageURL", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Enter section image URL"
                    />
                  </div>
                  {/* Small Image Preview */}
                  {section.imageURL && (
                    <div className="mb-2">
                      <img
                        src={section.imageURL}
                        alt={`Preview for Section ${index + 1}`}
                        className="w-20 h-20 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Sections Button */}
              <button
                type="button"
                onClick={handleAddSection}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Add More Section
              </button>
            </div>

            {/* Right Column for Image URL and Dynamic Details */}
            <div className="flex-shrink-0 md:w-1/3 flex flex-col">
              {/* Image Preview */}
              <div className="mb-4 flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                  {imageURL ? (
                    <img
                      src={imageURL}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No Image
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-800 mb-2 dark:text-gray-200"
                  htmlFor="imageURL"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageURL"
                  value={imageURL}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  placeholder="Enter image URL"
                />
              </div>

              {/* Dynamically Generated Details */}
              {details.map((detail, index) => (
                <div key={index} className="mb-4 border p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Detail {index + 1}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className="bg-rose-600 text-white px-2 py-1 rounded hover:bg-rose-900"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mb-2">
                    <label
                      className="block text-gray-800 mb-1 dark:text-gray-200"
                      htmlFor={`detail-title-${index}`}
                    >
                      Detail Title
                    </label>
                    <input
                      type="text"
                      id={`detail-title-${index}`}
                      value={detail.title}
                      onChange={(e) =>
                        handleDetailChange(index, "title", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      placeholder="Enter detail title"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-800 mb-1 dark:text-gray-200"
                      htmlFor={`detail-body-${index}`}
                    >
                      Detail Body
                    </label>
                    <textarea
                      id={`detail-body-${index}`}
                      value={detail.body}
                      onChange={(e) =>
                        handleDetailChange(index, "body", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      rows={4}
                      placeholder="Enter detail body"
                    />
                  </div>
                </div>
              ))}

              {/* Add More Details Button */}
              <button
                type="button"
                onClick={handleAddDetail}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 mt-4"
              >
                Add More Detail
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit
            </button>
          </div>

          <footer className="text-center text-gray-500 text-sm mt-4 dark:text-gray-400">
            © 2024 Humps Wiki. All rights reserved.
          </footer>
        </form>
      </div>
    </>
  );
}
