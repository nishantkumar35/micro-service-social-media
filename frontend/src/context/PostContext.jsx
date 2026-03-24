import React, { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching posts from:", axiosInstance.defaults.baseURL + "/v1/posts/all-posts");
      const response = await axiosInstance.get("/v1/posts/all-posts");
      console.log("Fetch posts response:", response.data);
      setPosts(response.data.posts || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch posts detailed error:");
      console.dir(err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      setError(`Failed to load posts (${err.response?.status || 'Network Error'}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData) => {
    try {
      console.log("Creating post with payload:", {
        content: postData.content,
        mediaIds: postData.mediaIds,
      });
      const response = await axiosInstance.post("/v1/posts/create-post", {
        content: postData.content,
        mediaIds: postData.mediaIds || (postData.image ? [postData.image] : []),
      });
      await fetchPosts(); // Re-fetch since backend doesn't return the new post
      return { success: true };
    } catch (err) {
      console.error("Failed to create post:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Failed to create post." 
      };
    }
  };

  const uploadMedia = async (formData) => {
    try {
      const response = await axiosInstance.post("/v1/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Media upload failed:", err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Media upload failed." 
      };
    }
  };

  const deletePost = async (id) => {
    try {
      await axiosInstance.delete(`/v1/posts/${id}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      return { success: true };
    } catch (err) {
      console.error("Failed to delete post:", err);
      return { success: false, message: "Failed to delete post." };
    }
  };

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    uploadMedia,
    deletePost,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};
