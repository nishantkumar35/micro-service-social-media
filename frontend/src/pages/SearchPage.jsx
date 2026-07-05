import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/posts/PostCard";
import { Search, Loader2, SearchX } from "lucide-react";

const SearchPage = () => {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Sanitise colon which breaks MongoDB $text search
      const sanitized = q.replace(/:/g, " ");
      const response  = await axiosInstance.get("/v1/search/posts", {
        params: { query: sanitized },
      });

      const data       = response.data;
      const rawResults = Array.isArray(data)
        ? data
        : data.posts || data.data || [];

      const formatted = rawResults.map((item) => ({
        ...item,
        _id:      item.postId || item._id || item.id,
        user:     item.userId  || item.user,
        mediaIds: Array.isArray(item.mediaIds)
          ? item.mediaIds.map((m) =>
              typeof m === "string" ? m : m.url || m.type || ""
            )
          : [],
      }));

      setResults(formatted);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#60a5fa,#2563eb)",
            boxShadow: "0 4px 0px #1d4ed8",
          }}
        >
          <Search size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-purple-900">Search</h1>
          <p className="text-xs font-semibold text-purple-400">Find posts and people 🔍</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-1"
          style={{
            background: "#fff",
            border: "2.5px solid #bfdbfe",
            boxShadow: "4px 5px 0px #bfdbfe",
          }}
        >
          <Search size={18} className="text-blue-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for posts, keywords…"
            className="flex-1 py-3 bg-transparent border-none outline-none text-sm font-semibold text-purple-900 placeholder-blue-300"
            style={{ fontFamily: "Nunito, sans-serif" }}
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="clay-btn clay-btn-primary px-4 py-2 text-sm flex items-center gap-1.5 flex-shrink-0"
            style={!query.trim() || loading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg,#60a5fa,#2563eb)",
              boxShadow: "0 5px 0px #1d4ed8",
            }}
          >
            <Loader2 size={24} className="text-white animate-spin" />
          </div>
          <p className="text-sm font-bold text-blue-400">Searching…</p>
        </div>
      ) : error ? (
        <div
          className="clay-card p-6 text-center"
          style={{ boxShadow: "5px 6px 0px rgba(244,114,182,0.4)" }}
        >
          <p className="text-sm font-bold text-pink-500 mb-3">{error}</p>
          <button
            onClick={() => { setError(""); setSearched(false); }}
            className="clay-btn clay-btn-ghost px-4 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      ) : results.length > 0 ? (
        <div>
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          {results.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))}
        </div>
      ) : searched ? (
        <div className="clay-card p-12 text-center">
          <SearchX size={40} className="text-blue-200 mx-auto mb-4" />
          <h3 className="text-base font-black text-purple-900 mb-1">
            No results for &ldquo;{query}&rdquo;
          </h3>
          <p className="text-sm font-semibold text-purple-400">
            Try different keywords
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl mb-4">🔭</div>
          <p className="text-base font-black text-purple-300">
            Type something to start searching
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
