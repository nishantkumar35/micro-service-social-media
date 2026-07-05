import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostContext";
import PostCard from "../components/posts/PostCard";
import FollowButton from "../components/posts/FollowButton";
import {
  Mail,
  Calendar,
  MapPin,
  Edit2,
  Users,
  UserCheck,
  Loader2,
  LayoutGrid,
} from "lucide-react";

/* Avatar gradient palette — same as PostCard */
const GRADIENTS = [
  ["#8b5cf6","#c026d3","#6d28d9"],
  ["#34d399","#059669","#047857"],
  ["#fb923c","#ea580c","#c2410c"],
  ["#60a5fa","#2563eb","#1d4ed8"],
  ["#f472b6","#db2777","#be185d"],
  ["#fbbf24","#d97706","#b45309"],
];
function avatarGrad(name = "") {
  const idx = (name.charCodeAt(0) || 0) % GRADIENTS.length;
  return GRADIENTS[idx];
}

const StatPill = ({ value, label, loading }) => (
  <div
    className="flex flex-col items-center px-5 py-3 rounded-2xl"
    style={{
      background: "rgba(139,92,246,0.08)",
      border: "2px solid rgba(196,181,253,0.35)",
    }}
  >
    {loading ? (
      <Loader2 size={16} className="animate-spin text-purple-400" />
    ) : (
      <span className="text-xl font-black text-purple-900">{value}</span>
    )}
    <span className="text-xs font-bold text-purple-400 mt-0.5">{label}</span>
  </div>
);

const ProfilePage = ({ targetUserId }) => {
  const { userId: routeUserId } = useParams();
  const { user: currentUser } = useAuth();
  const { posts, fetchPosts, loading, getFollowStats, getUserProfile } = usePosts();

  const profileUserId = targetUserId || routeUserId || currentUser?.id || currentUser?.userId;
  const isOwnProfile  = profileUserId?.toString() === (currentUser?.id || currentUser?.userId)?.toString();

  const [profileUser, setProfileUser] = useState(isOwnProfile ? currentUser : null);
  const [profileUserLoading, setProfileUserLoading] = useState(!isOwnProfile);
  const [followStats, setFollowStats]   = useState({ followersCount: 0, followingCount: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const refreshStats = () => {
    if (!profileUserId) return;
    getFollowStats(profileUserId).then((result) => {
      if (result.success) setFollowStats(result.data);
    });
  };

  useEffect(() => {
    if (!profileUserId) return;
    setStatsLoading(true);
    getFollowStats(profileUserId).then((result) => {
      if (result.success) setFollowStats(result.data);
      setStatsLoading(false);
    });
  }, [profileUserId, getFollowStats]);

  useEffect(() => {
    if (isOwnProfile) {
      setProfileUser(currentUser);
      setProfileUserLoading(false);
    } else if (profileUserId) {
      setProfileUserLoading(true);
      getUserProfile(profileUserId).then((res) => {
        if (res.success) {
          setProfileUser(res.data);
        } else {
          setProfileUser({ username: "User", email: "" });
        }
        setProfileUserLoading(false);
      });
    }
  }, [profileUserId, isOwnProfile, currentUser, getUserProfile]);

  if (!currentUser) return null;
  if (profileUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-purple-300">Loading profile…</p>
      </div>
    );
  }

  const userPosts = posts.filter((p) => {
    const pid = (p.user || p.userId)?.toString();
    return pid === profileUserId?.toString();
  });

  const [from, to, shadow] = avatarGrad(profileUser?.username || "");

  return (
    <div>
      {/* ── Profile card ────────────────────────────────────────────── */}
      <div
        className="clay-card overflow-hidden mb-6"
        style={{ padding: 0 }}
      >
        {/* Banner */}
        <div
          className="h-28 z-0 relative"
          style={{
            background: `linear-gradient(135deg,${from} 0%,${to} 50%,#ec4899 100%)`,
          }}
        >
          {/* decorative circles */}
          <div
            className="absolute  right-8 top-4 w-16 h-16 rounded-full opacity-20"
            style={{ background: "#fff" }}
          />
          <div
            className="absolute  right-16 top-10 w-8 h-8 rounded-full opacity-15"
            style={{ background: "#fff" }}
          />
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Big avatar */}
            <div
              className="w-20 h-20 z-10 rounded-3xl flex items-center justify-center text-white text-3xl font-black"
              style={{
                background: `linear-gradient(135deg,${from},${to})`,
                boxShadow: `0 6px 0px ${shadow}, 0 10px 24px ${shadow}55`,
                border: "4px solid #fff",
              }}
            >
              {profileUser.username?.[0]?.toUpperCase() || "U"}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pb-1">
              {!isOwnProfile && profileUserId ? (
                <FollowButton userId={profileUserId} onFollowChange={refreshStats} />
              ) : (
                <button
                  className="clay-btn clay-btn-ghost flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <h1 className="text-2xl font-black text-purple-900 leading-tight">
            {profileUser.username}
          </h1>
          <p className="text-sm font-semibold text-purple-400 mb-4">
            @{profileUser.username?.toLowerCase().replace(/\s/g, "")}
          </p>

          {/* Stat pills */}
          <div className="flex gap-3 mb-4">
            <StatPill
              value={followStats.followersCount}
              label="Followers"
              loading={statsLoading}
            />
            <StatPill
              value={followStats.followingCount}
              label="Following"
              loading={statsLoading}
            />
            <StatPill
              value={userPosts.length}
              label="Posts"
              loading={loading}
            />
          </div>

          {/* Meta info */}
          <div className="space-y-2">
            {profileUser.email && (
              <div className="flex items-center gap-2.5 text-sm font-semibold text-purple-500">
                <Mail size={15} className="text-purple-300 flex-shrink-0" />
                {profileUser.email}
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm font-semibold text-purple-500">
              <Calendar size={15} className="text-purple-300 flex-shrink-0" />
              Joined March 2024
            </div>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-purple-500">
              <MapPin size={15} className="text-purple-300 flex-shrink-0" />
              San Francisco, CA
            </div>
          </div>
        </div>
      </div>

      {/* ── Posts section ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg,${from},${to})`,
            boxShadow: `0 3px 0px ${shadow}`,
          }}
        >
          <LayoutGrid size={15} className="text-white" />
        </div>
        <h2 className="text-base font-black text-purple-900">
          {isOwnProfile ? "My Posts" : "Posts"}
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={28} className="animate-spin text-purple-400 mb-3" />
          <p className="text-sm font-bold text-purple-300">Loading posts…</p>
        </div>
      ) : userPosts.length > 0 ? (
        userPosts.map((post) => (
          <PostCard key={post._id || post.id} post={post} />
        ))
      ) : (
        <div className="clay-card p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm font-bold text-purple-400">
            {isOwnProfile
              ? "You haven't posted anything yet — share something!"
              : "This user hasn't posted yet."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
