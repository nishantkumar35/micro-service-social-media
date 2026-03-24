import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/posts/PostCard";
import { Search, Loader2 } from "lucide-react";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/v1/search/posts", {
        params: { query }
      });
      const data = response.data;
      const rawResults = Array.isArray(data) ? data : (data.posts || data.data || []);
      
      // Map Search service fields to PostCard expected fields
      const formattedResults = rawResults.map(item => {
        // Handle potential nested mediaIds from the original schema
        const normalizedMediaIds = Array.isArray(item.mediaIds) 
          ? item.mediaIds.map(m => typeof m === 'string' ? m : (m.type || m.url || ""))
          : [];

        return {
          ...item,
          _id: item.postId || item._id || item.id,
          user: item.userId || item.user,
          mediaIds: normalizedMediaIds
        };
      });

      setResults(formattedResults);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search</h1>
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
            placeholder="Search for posts or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Searching...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-center">
            {error}
          </div>
        ) : results.length > 0 ? (
          results.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))
        ) : query && !loading ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500">
            No results found for "{query}"
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-lg">Type something to start searching</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
