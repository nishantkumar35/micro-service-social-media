import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import { usePosts } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";
import FollowButton from "./FollowButton";

/* ─── Helper: relative time ──────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ─── Avatar color palette ───────────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  ["#8b5cf6","#c026d3","#6d28d9"],
  ["#34d399","#059669","#047857"],
  ["#fb923c","#ea580c","#c2410c"],
  ["#60a5fa","#2563eb","#1d4ed8"],
  ["#f472b6","#db2777","#be185d"],
  ["#fbbf24","#d97706","#b45309"],
];
function avatarGradient(name = "") {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

/* ─── PostCard ───────────────────────────────────────────────────────── */
const PostCard = ({ post }) => {
  const {
    content,
    user: postUserId,
    createdAt,
    mediaIds,
    _id,
    username: postUsername,
  } = post;

  const { deletePost, likePost, getComments, addComment, deleteComment } = usePosts();
  const { user: currentUser } = useAuth();

  const targetUserIdStr = typeof postUserId === "object" ? postUserId?._id || postUserId?.id : postUserId;

  const isAuthor =
    currentUser?.id === targetUserIdStr ||
    currentUser?.userId === targetUserIdStr;

  const currentUserId = currentUser?.id || currentUser?.userId;
  const isLikedInitially = post.likes?.includes(currentUserId) || post._liked || false;

  const [imgIdx, setImgIdx]               = useState(0);
  const [liked, setLiked]                 = useState(isLikedInitially);
  const [likesCount, setLikesCount]       = useState(post.likesCount || 0);
  const [likeLoading, setLikeLoading]     = useState(false);
  const [likeAnim, setLikeAnim]           = useState(false);

  const [commentsOpen, setCommentsOpen]   = useState(false);
  const [comments, setComments]           = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText]     = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [commentPage, setCommentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const displayName =
    postUsername ||
    (isAuthor ? currentUser?.username || "You" : "User");

  const [from, to, shadow] = avatarGradient(displayName);

  /* ── Image nav ─────────────────────────────────────────────────────── */
  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx((p) => (p - 1 + mediaIds.length) % mediaIds.length);
  };
  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx((p) => (p + 1) % mediaIds.length);
  };

  /* ── Like ──────────────────────────────────────────────────────────── */
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    setLikeAnim(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    const result = await likePost(_id);
    if (result.success) {
      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } else {
      setLiked(!nextLiked);
      setLikesCount((c) => (nextLiked ? Math.max(0, c - 1) : c + 1));
    }
    setLikeLoading(false);
    setTimeout(() => setLikeAnim(false), 400);
  };

  /* ── Comments ──────────────────────────────────────────────────────── */
  const loadComments = useCallback(
    async (page = 1) => {
      setCommentsLoading(true);
      const result = await getComments(_id, page);
      if (result.success) {
        if (page === 1) setComments(result.data.comments || []);
        else setComments((prev) => [...prev, ...(result.data.comments || [])]);
        setTotalPages(result.data.totalPages || 1);
        setCommentPage(page);
        setCommentsLoaded(true);
      }
      setCommentsLoading(false);
    },
    [_id, getComments]
  );

  const toggleComments = () => {
    const opening = !commentsOpen;
    setCommentsOpen(opening);
    if (opening && !commentsLoaded) loadComments(1);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitLoading) return;
    setSubmitLoading(true);
    const result = await addComment(_id, commentText.trim());
    if (result.success) {
      setComments((prev) => [result.comment, ...prev]);
      setCommentText("");
    }
    setSubmitLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    const result = await deleteComment(_id, commentId);
    if (result.success) setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <article className="clay-card animate-fade-up" style={{ marginBottom: "1.25rem" }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 pb-3">
        <Link
          to={`/profile/${targetUserIdStr}`}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity group"
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{
              background: `linear-gradient(135deg,${from},${to})`,
              boxShadow: `0 3px 0px ${shadow}`,
            }}
          >
            {displayName[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-black text-purple-900 leading-tight group-hover:text-purple-700 transition-colors">
              {displayName}
            </p>
            <p className="text-xs font-semibold text-purple-400">{timeAgo(createdAt)}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isAuthor && targetUserIdStr && (
            <FollowButton userId={targetUserIdStr} size="sm" />
          )}
          {isAuthor && (
            <button
              onClick={async () => {
                if (window.confirm("Delete this post?")) await deletePost(_id);
              }}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: "rgba(244,114,182,0.1)",
                border: "2px solid rgba(244,114,182,0.2)",
              }}
              title="Delete post"
            >
              <Trash2 size={14} className="text-pink-400" />
            </button>
          )}
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center text-purple-300 hover:text-purple-500 transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {content && (
        <p
          className="px-4 pb-3 text-sm font-semibold leading-relaxed"
          style={{ color: "#1e1b4b" }}
        >
          {content}
        </p>
      )}

      {/* ── Media ────────────────────────────────────────────────────── */}
      {mediaIds?.length > 0 && (
        <div className="relative mx-4 mb-3 rounded-2xl overflow-hidden aspect-video bg-purple-50 group"
          style={{ border: "2px solid #ede9fe" }}>
          <img
            src={mediaIds[imgIdx]}
            alt={`Post media ${imgIdx + 1}`}
            className="w-full h-full object-cover"
          />
          {mediaIds.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              >
                <ChevronLeft size={16} className="text-white" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
              >
                <ChevronRight size={16} className="text-white" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {mediaIds.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className="h-1.5 rounded-full cursor-pointer transition-all"
                    style={{
                      width: i === imgIdx ? "20px" : "6px",
                      background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 pb-3 pt-2"
        style={{ borderTop: "2px dashed #ede9fe" }}
      >
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            id={`like-btn-${_id}`}
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-sm transition-all ${likeAnim ? "animate-like-pop" : ""}`}
            style={
              liked
                ? {
                    background: "rgba(244,114,182,0.15)",
                    color: "#db2777",
                    border: "2px solid rgba(244,114,182,0.3)",
                  }
                : {
                    background: "rgba(139,92,246,0.07)",
                    color: "#a78bfa",
                    border: "2px solid rgba(139,92,246,0.12)",
                  }
            }
          >
            <Heart
              size={16}
              className="transition-transform"
              style={liked ? { fill: "#db2777", color: "#db2777" } : {}}
            />
            <span>{likesCount > 0 ? likesCount : "Like"}</span>
          </button>

          {/* Comment toggle */}
          <button
            id={`comment-btn-${_id}`}
            onClick={toggleComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-sm transition-all"
            style={
              commentsOpen
                ? {
                    background: "rgba(96,165,250,0.15)",
                    color: "#2563eb",
                    border: "2px solid rgba(96,165,250,0.3)",
                  }
                : {
                    background: "rgba(139,92,246,0.07)",
                    color: "#a78bfa",
                    border: "2px solid rgba(139,92,246,0.12)",
                  }
            }
          >
            <MessageCircle size={16} />
            <span>
              {comments.length > 0 ? comments.length : "Comment"}
            </span>
            {commentsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Share */}
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-sm transition-all"
          style={{
            background: "rgba(139,92,246,0.07)",
            color: "#a78bfa",
            border: "2px solid rgba(139,92,246,0.12)",
          }}
        >
          <Share2 size={15} />
          <span>Share</span>
        </button>
      </div>

      {/* ── Comment Section ───────────────────────────────────────────── */}
      {commentsOpen && (
        <div
          style={{
            borderTop: "2px solid #ede9fe",
            background: "linear-gradient(135deg,rgba(245,243,255,0.8),rgba(237,233,254,0.5))",
            borderRadius: "0 0 22px 22px",
          }}
        >
          {/* Input */}
          <form
            onSubmit={handleAddComment}
            className="flex items-center gap-2.5 px-4 py-3"
            style={{ borderBottom: "2px dashed #ede9fe" }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#c026d3)",
                boxShadow: "0 2px 0px #6d28d9",
              }}
            >
              {currentUser?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div
              className="flex-1 flex items-center overflow-hidden"
              style={{
                background: "#fff",
                border: "2px solid #e9d5ff",
                borderRadius: "16px",
              }}
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
                className="flex-1 px-3 py-2 text-sm font-semibold bg-transparent border-none outline-none text-purple-900 placeholder-purple-300"
                style={{ fontFamily: "Nunito, sans-serif" }}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || submitLoading}
                className="pr-3 flex items-center text-purple-400 hover:text-purple-700 disabled:opacity-40 transition-colors flex-shrink-0"
              >
                {submitLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </form>

          {/* List */}
          <div className="px-4 py-2 space-y-2.5 max-h-72 overflow-y-auto">
            {commentsLoading && comments.length === 0 ? (
              <div className="flex justify-center py-5">
                <Loader2 size={20} className="animate-spin text-purple-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm font-semibold text-purple-300 py-5">
                No comments yet — say something! 💬
              </p>
            ) : (
              comments.map((comment) => {
                const isMine =
                  comment.user === currentUser?.id ||
                  comment.user === currentUser?.userId;
                const [cf, ct, cs] = avatarGradient(comment.username || "");
                return (
                  <div key={comment._id} className="flex gap-2.5 group">
                    <Link
                      to={`/profile/${comment.user}`}
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-white font-black text-xs flex-shrink-0 mt-0.5 hover:opacity-85 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg,${cf},${ct})`,
                        boxShadow: `0 2px 0px ${cs}`,
                      }}
                    >
                      {comment.username?.[0]?.toUpperCase() || "U"}
                    </Link>
                    <div
                      className="flex-1 rounded-2xl px-3 py-2"
                      style={{
                        background: "#fff",
                        border: "2px solid #ede9fe",
                        boxShadow: "2px 3px 0px #e9d5ff",
                      }}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <Link
                          to={`/profile/${comment.user}`}
                          className="text-xs font-black text-purple-900 hover:text-purple-700 transition-colors"
                        >
                          {comment.username || "User"}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-purple-300">
                            {timeAgo(comment.createdAt)}
                          </span>
                          {isMine && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="opacity-0 group-hover:opacity-100 text-pink-400 hover:text-pink-600 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-purple-800 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {commentPage < totalPages && (
              <button
                onClick={() => loadComments(commentPage + 1)}
                disabled={commentsLoading}
                className="w-full text-xs font-bold text-purple-500 hover:text-purple-700 py-2 flex items-center justify-center gap-1 transition-colors"
              >
                {commentsLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  "Load more comments ↓"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
