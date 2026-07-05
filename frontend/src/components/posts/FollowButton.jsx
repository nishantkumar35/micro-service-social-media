import React, { useState, useEffect } from "react";
import { UserPlus, UserMinus, UserCheck, Loader2 } from "lucide-react";
import { usePosts } from "../../context/PostContext";

const FollowButton = ({ userId, onFollowChange, size = "md" }) => {
  const targetId = typeof userId === "object" ? userId?._id || userId?.id : userId;

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [checking, setChecking]       = useState(true);
  const [isHovered, setIsHovered]     = useState(false);
  const { followUser, unfollowUser, checkIsFollowing }  = usePosts();

  useEffect(() => {
    if (!targetId) return;
    setChecking(true);
    checkIsFollowing(targetId).then((result) => {
      if (result.success) {
        setIsFollowing(result.isFollowing);
      }
      setChecking(false);
    });
  }, [targetId, checkIsFollowing]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || checking) return;
    setLoading(true);

    const result = isFollowing
      ? await unfollowUser(targetId)
      : await followUser(targetId);

    if (result.success) {
      const next = !isFollowing;
      setIsFollowing(next);
      onFollowChange?.(next);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center p-1">
        <Loader2 size={size === "sm" ? 12 : 16} className="animate-spin text-purple-500" />
      </div>
    );
  }

  const isSmall = size === "sm";

  // Clay styling options
  const styleNotFollowing = {
    background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    color: "#fff",
    border: "2px solid rgba(0,0,0,0.06)",
    borderRadius: isSmall ? "12px" : "16px",
    boxShadow: isSmall
      ? "0 2px 0px #6d28d9, 0 3px 6px rgba(109,40,217,0.2)"
      : "0 4px 0px #6d28d9, 0 6px 14px rgba(109,40,217,0.25)",
    opacity: loading ? 0.6 : 1,
  };

  const styleFollowingNormal = {
    background: "rgba(139,92,246,0.07)",
    color: "#7c3aed",
    border: "2px solid rgba(139,92,246,0.2)",
    borderRadius: isSmall ? "12px" : "16px",
    boxShadow: "none",
    opacity: loading ? 0.6 : 1,
  };

  const styleFollowingHovered = {
    background: "rgba(244,114,182,0.12)",
    color: "#db2777",
    border: "2px solid rgba(244,114,182,0.3)",
    borderRadius: isSmall ? "12px" : "16px",
    boxShadow: "none",
    opacity: loading ? 0.6 : 1,
  };

  const getButtonStyle = () => {
    if (!isFollowing) return styleNotFollowing;
    return isHovered ? styleFollowingHovered : styleFollowingNormal;
  };

  const btnPadding = isSmall ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm";
  const iconSize = isSmall ? 13 : 15;

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={loading}
      className={`clay-btn flex items-center gap-1.5 font-black transition-all ${btnPadding}`}
      style={getButtonStyle()}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : isFollowing ? (
        isHovered ? (
          <>
            <UserMinus size={iconSize} /> Unfollow
          </>
        ) : (
          <>
            <UserCheck size={iconSize} /> Following
          </>
        )
      ) : (
        <>
          <UserPlus size={iconSize} /> Follow
        </>
      )}
    </button>
  );
};

export default FollowButton;
