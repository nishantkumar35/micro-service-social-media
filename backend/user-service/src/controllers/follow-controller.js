const Follow = require("../models/Follow");
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Follow a user.
 * The authenticated user (follower) follows the target user (userId param).
 */
const followUser = async (req, res) => {
  logger.info("Follow user endpoint hit");
  try {
    const followerId = req.headers["x-user-id"];
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Verify target user exists
    const targetUser = await User.findById(followingId).select("username");
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Create follow (compound unique index prevents duplicates)
    const follow = new Follow({ follower: followerId, following: followingId });
    await follow.save();

    logger.info(`User ${followerId} followed user ${followingId}`);
    res.status(201).json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      followedUser: {
        userId: followingId,
        username: targetUser.username,
      },
    });
  } catch (e) {
    // Duplicate key error → already following
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already following this user",
      });
    }
    logger.error("Error following user", e);
    res.status(500).json({ success: false, message: "Error following user" });
  }
};

/**
 * Unfollow a user.
 */
const unfollowUser = async (req, res) => {
  logger.info("Unfollow user endpoint hit");
  try {
    const followerId = req.headers["x-user-id"];
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: "You cannot unfollow yourself",
      });
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this user",
      });
    }

    logger.info(`User ${followerId} unfollowed user ${followingId}`);
    res.json({ success: true, message: "Successfully unfollowed" });
  } catch (e) {
    logger.error("Error unfollowing user", e);
    res.status(500).json({ success: false, message: "Error unfollowing user" });
  }
};

/**
 * Get followers of a user (who follows them).
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .skip(skip)
      .limit(limit)
      .populate("follower", "username email createdAt")
      .sort({ createdAt: -1 });

    const totalFollowers = await Follow.countDocuments({ following: userId });

    res.json({
      success: true,
      followers: followers.map((f) => ({
        userId: f.follower._id,
        username: f.follower.username,
        followedSince: f.createdAt,
      })),
      currentPage: page,
      totalPages: Math.ceil(totalFollowers / limit),
      totalFollowers,
    });
  } catch (e) {
    logger.error("Error fetching followers", e);
    res.status(500).json({ success: false, message: "Error fetching followers" });
  }
};

/**
 * Get following list of a user (who they follow).
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .skip(skip)
      .limit(limit)
      .populate("following", "username email createdAt")
      .sort({ createdAt: -1 });

    const totalFollowing = await Follow.countDocuments({ follower: userId });

    res.json({
      success: true,
      following: following.map((f) => ({
        userId: f.following._id,
        username: f.following.username,
        followingSince: f.createdAt,
      })),
      currentPage: page,
      totalPages: Math.ceil(totalFollowing / limit),
      totalFollowing,
    });
  } catch (e) {
    logger.error("Error fetching following", e);
    res.status(500).json({ success: false, message: "Error fetching following" });
  }
};

/**
 * Get follow stats (counts) for a user.
 */
const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId }),
    ]);

    res.json({
      success: true,
      userId,
      followersCount,
      followingCount,
    });
  } catch (e) {
    logger.error("Error fetching follow stats", e);
    res.status(500).json({ success: false, message: "Error fetching follow stats" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("username email createdAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    logger.error("Error fetching user profile", e);
    res.status(500).json({ success: false, message: "Error fetching user profile" });
  }
};

const checkIsFollowing = async (req, res) => {
  try {
    const followerId = req.headers["x-user-id"];
    const followingId = req.params.userId;

    const follow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    res.json({
      success: true,
      isFollowing: !!follow,
    });
  } catch (e) {
    logger.error("Error checking follow status", e);
    res.status(500).json({ success: false, message: "Error checking follow status" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  getUserProfile,
  checkIsFollowing,
};
