import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import PostCard from "../components/posts/PostCard";
import { User, Mail, Calendar, MapPin, Edit2 } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { posts, fetchPosts, loading } = usePosts();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (!user) return null;

  const userPosts = posts.filter(post => post.user === user.id);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="p-1 bg-white rounded-full">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border-4 border-white">
                <User className="w-12 h-12" />
              </div>
            </div>
            <button className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold transition-all border border-gray-200">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">{user.username}</h1>
            <p className="text-gray-500">@{user.username?.toLowerCase().replace(/\s/g, "")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Joined March 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 ml-1">My Posts</h2>
        {loading ? (
          <div className="text-center py-10 text-gray-500 italic">Loading your posts...</div>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500">
            You haven't posted anything yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
