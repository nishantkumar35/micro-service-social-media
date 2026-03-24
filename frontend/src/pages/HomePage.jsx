import React, { useEffect } from "react";
import { usePosts } from "../context/PostContext";
import CreatePost from "../components/posts/CreatePost";
import PostCard from "../components/posts/PostCard";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const { posts, loading, error, fetchPosts } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="animate-in fade-in duration-500">
      <CreatePost />
      
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your feed...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center">
            {error}
            <button 
              onClick={fetchPosts}
              className="block mx-auto mt-2 font-bold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 2v4a2 2 0 002 2h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No posts yet</h3>
            <p className="text-gray-500">Be the first to share something with the community!</p>
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
