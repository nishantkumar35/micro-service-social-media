const express = require("express");
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStats,
  getUserProfile,
  checkIsFollowing,
} = require("../controllers/follow-controller");

const router = express.Router();

// All follow routes require authentication (x-user-id injected by API Gateway)

// Get another user's profile info
router.get("/:userId/profile", getUserProfile);

// Check if currently following
router.get("/:userId/is-following", checkIsFollowing);

// Follow a user
router.post("/:userId/follow", followUser);

// Unfollow a user
router.delete("/:userId/unfollow", unfollowUser);

// Get followers of a user
router.get("/:userId/followers", getFollowers);

// Get following list of a user
router.get("/:userId/following", getFollowing);

// Get follower/following counts
router.get("/:userId/follow-stats", getFollowStats);

module.exports = router;
