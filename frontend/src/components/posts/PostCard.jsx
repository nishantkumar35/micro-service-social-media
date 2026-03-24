import React, { useState } from "react";
import { User, MessageCircle, Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { usePosts } from "../../context/PostContext";
import { useAuth } from "../../context/AuthContext";

const PostCard = ({ post }) => {
  const { content, user: postUserId, createdAt, mediaIds, _id } = post;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { deletePost } = usePosts();
  const { user: currentUser } = useAuth();
  
  const isAuthor = currentUser?.id === postUserId;
  const displayName = post.username || (isAuthor ? "Me" : "User " + (postUserId ? postUserId.substring(0, 4) : "Anon"));

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % mediaIds.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + mediaIds.length) % mediaIds.length);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden mb-6">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
              {displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{displayName}</h3>
              <p className="text-xs text-gray-500">
                {new Date(createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <button 
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this post?")) {
                    await deletePost(_id || post.id);
                  }
                }}
                className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            )}
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-gray-800 leading-relaxed mb-4">{content}</p>

        {mediaIds && mediaIds.length > 0 && (
          <div className="relative group rounded-xl overflow-hidden mb-4 bg-gray-50 aspect-video">
            <img
              src={mediaIds[currentImageIndex]}
              alt={`Post content ${currentImageIndex}`}
              className="w-full h-full object-cover transition-all duration-300"
            />
            
            {mediaIds.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {mediaIds.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full transition-all ${
                        i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Like</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">Comment</span>
            </button>
          </div>
          <button className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors group">
            <div className="p-2 rounded-full group-hover:bg-indigo-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
