const Post = require("../models/Post");
const logger = require("../utils/logger");

/**
 * Toggle like on a post.
 * If the user already liked → unlike. Otherwise → like.
 * Returns { liked: boolean, likesCount: number }
 */
const likePost = async (req, res) => {
  logger.info("Like/unlike post endpoint hit");
  try {
    const postId = req.params.id;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const alreadyLiked = post.likes.some(
      (likedUserId) => likedUserId.toString() === userId,
    );

    if (alreadyLiked) {
      // Unlike — pull userId from likes array
      post.likes.pull(userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Like — push userId to likes array
      post.likes.push(userId);
      post.likesCount = post.likesCount + 1;
    }

    await post.save();

    // Invalidate post cache (single post + all list pages)
    const listKeys = await req.redisClient.keys("posts:*");
    const keysToDelete = [`post:${postId}`, ...listKeys];
    if (keysToDelete.length > 0) await req.redisClient.del(keysToDelete);

    logger.info(`Post ${postId} ${alreadyLiked ? "unliked" : "liked"} by user ${userId}`);
    res.json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likesCount,
    });
  } catch (e) {
    logger.error("Error toggling like", e);
    res.status(500).json({ success: false, message: "Error toggling like" });
  }
};

/**
 * Get likes count and list for a post.
 */
const getLikes = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).select("likes likesCount");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({
      success: true,
      postId,
      likesCount: post.likesCount,
      likes: post.likes,
    });
  } catch (e) {
    logger.error("Error fetching likes", e);
    res.status(500).json({ success: false, message: "Error fetching likes" });
  }
};

module.exports = { likePost, getLikes };
