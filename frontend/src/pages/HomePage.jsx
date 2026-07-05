import React, { useEffect } from "react";
import { usePosts } from "../context/PostContext";
import CreatePost from "../components/posts/CreatePost";
import PostCard from "../components/posts/PostCard";
import { Loader2, Newspaper } from "lucide-react";

const HomePage = () => {
  const { posts, loading, error, fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
            boxShadow: "0 4px 0px #6d28d9",
          }}
        >
          <Newspaper size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-purple-900">Your Feed</h1>
          <p className="text-xs font-semibold text-purple-400">What's happening today ✨</p>
        </div>
      </div>

      {/* Create post */}
      <CreatePost />

      {/* Posts list */}
      <div>
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#c026d3)",
                boxShadow: "0 5px 0px #6d28d9",
              }}
            >
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
            <p className="text-sm font-bold text-purple-400">Loading your feed…</p>
          </div>
        ) : error ? (
          <div
            className="clay-card clay-card-pink p-6 text-center"
          >
            <p className="text-sm font-bold text-pink-600 mb-3">{error}</p>
            <button
              onClick={fetchPosts}
              className="clay-btn clay-btn-primary px-5 py-2 text-sm"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div
            className="clay-card p-12 text-center"
          >
            <div className="text-5xl mb-4">🌱</div>
            <h3 className="text-lg font-black text-purple-900 mb-1">Nothing here yet</h3>
            <p className="text-sm font-semibold text-purple-400">
              Be the first to post something amazing!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
