import React, { createContext, useContext, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Posts ─────────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/v1/posts/all-posts");
      setPosts(response.data.posts || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError(`Failed to load posts (${err.response?.status || "Network Error"}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = async (postData) => {
    try {
      await axiosInstance.post("/v1/posts/create-post", {
        content: postData.content,
        mediaIds: postData.mediaIds || (postData.image ? [postData.image] : []),
      });
      await fetchPosts();
      return { success: true };
    } catch (err) {
      console.error("Failed to create post:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create post.",
      };
    }
  };

  const uploadMedia = async (formData) => {
    try {
      const response = await axiosInstance.post("/v1/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Media upload failed:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Media upload failed.",
      };
    }
  };

  const deletePost = async (id) => {
    try {
      await axiosInstance.delete(`/v1/posts/${id}`);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      return { success: true };
    } catch (err) {
      if (err.response?.status === 404) {
        setPosts((prev) => prev.filter((post) => post._id !== id));
        return { success: true };
      }
      console.error("Failed to delete post:", err);
      return { success: false, message: "Failed to delete post." };
    }
  };

  // ── Likes ─────────────────────────────────────────────────────────────────

  const likePost = async (postId) => {
    try {
      const response = await axiosInstance.post(`/v1/posts/${postId}/like`);
      const { liked, likesCount } = response.data;
      // Optimistically update the post in state
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likesCount, _liked: liked } : p
        )
      );
      return { success: true, liked, likesCount };
    } catch (err) {
      console.error("Failed to toggle like:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to like post.",
      };
    }
  };

  // ── Comments ──────────────────────────────────────────────────────────────

  const getComments = async (postId, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(
        `/v1/posts/${postId}/comments`,
        { params: { page, limit } }
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to load comments.",
      };
    }
  };

  const addComment = async (postId, content) => {
    try {
      const response = await axiosInstance.post(`/v1/posts/${postId}/comments`, {
        content,
      });
      return { success: true, comment: response.data.comment };
    } catch (err) {
      console.error("Failed to add comment:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add comment.",
      };
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await axiosInstance.delete(`/v1/posts/${postId}/comments/${commentId}`);
      return { success: true };
    } catch (err) {
      console.error("Failed to delete comment:", err);
      return { success: false, message: "Failed to delete comment." };
    }
  };

  // ── Follow / Unfollow ─────────────────────────────────────────────────────

  const followUser = useCallback(async (userId) => {
    try {
      const response = await axiosInstance.post(`/v1/users/${userId}/follow`);
      return { success: true, data: response.data };
    } catch (err) {
      // 409 = already following — treat as soft success
      if (err.response?.status === 409) {
        return { success: true, alreadyFollowing: true };
      }
      console.error("Failed to follow user:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to follow user.",
      };
    }
  }, []);

  const unfollowUser = useCallback(async (userId) => {
    try {
      await axiosInstance.delete(`/v1/users/${userId}/unfollow`);
      return { success: true };
    } catch (err) {
      console.error("Failed to unfollow user:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to unfollow user.",
      };
    }
  }, []);

  const getFollowStats = useCallback(async (userId) => {
    try {
      const response = await axiosInstance.get(`/v1/users/${userId}/follow-stats`);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Failed to get follow stats:", err);
      return { success: false, data: { followersCount: 0, followingCount: 0 } };
    }
  }, []);

  const getFollowers = useCallback(async (userId, page = 1) => {
    try {
      const response = await axiosInstance.get(
        `/v1/users/${userId}/followers`,
        { params: { page, limit: 20 } }
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Failed to get followers:", err);
      return { success: false, data: { followers: [] } };
    }
  }, []);

  const getFollowing = useCallback(async (userId, page = 1) => {
    try {
      const response = await axiosInstance.get(
        `/v1/users/${userId}/following`,
        { params: { page, limit: 20 } }
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Failed to get following:", err);
      return { success: false, data: { following: [] } };
    }
  }, []);

  const getUserProfile = useCallback(async (userId) => {
    try {
      const response = await axiosInstance.get(`/v1/users/${userId}/profile`);
      return { success: true, data: response.data.user };
    } catch (err) {
      console.error("Failed to get user profile:", err);
      return { success: false, message: "Failed to load user profile." };
    }
  }, []);

  const checkIsFollowing = useCallback(async (userId) => {
    try {
      const response = await axiosInstance.get(`/v1/users/${userId}/is-following`);
      return { success: true, isFollowing: response.data.isFollowing };
    } catch (err) {
      console.error("Failed to check follow status:", err);
      return { success: false, isFollowing: false };
    }
  }, []);

  const value = {
    posts,
    loading,
    error,
    // Posts
    fetchPosts,
    createPost,
    uploadMedia,
    deletePost,
    // Likes
    likePost,
    // Comments
    getComments,
    addComment,
    deleteComment,
    // Follow
    followUser,
    unfollowUser,
    getFollowStats,
    getFollowers,
    getFollowing,
    getUserProfile,
    checkIsFollowing,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};
