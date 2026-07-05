const Comment = require("../models/Comment");
const Post = require("../models/Post");
const logger = require("../utils/logger");
const { validateComment } = require("../utils/validation");

/**
 * Add a comment to a post.
 */
const addComment = async (req, res) => {
  logger.info("Add comment endpoint hit");
  try {
    const { error } = validateComment(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const postId = req.params.id;
    const userId = req.user.userId;
    const username = req.headers["x-user-name"] || "Anonymous";
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const newComment = new Comment({
      post: postId,
      user: userId,
      username,
      content,
    });

    await newComment.save();

    // Invalidate comment cache for this post (KEYS supports glob, DEL does not)
    const commentKeys = await req.redisClient.keys(`comments:${postId}:*`);
    if (commentKeys.length > 0) await req.redisClient.del(commentKeys);

    logger.info(`Comment added to post ${postId} by user ${userId}`);
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (e) {
    logger.error("Error adding comment", e);
    res.status(500).json({ success: false, message: "Error adding comment" });
  }
};

/**
 * Get paginated comments for a post (cached).
 */
const getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `comments:${postId}:${page}:${limit}`;
    const cachedComments = await req.redisClient.get(cacheKey);
    if (cachedComments) {
      return res.json(JSON.parse(cachedComments));
    }

    const post = await Post.findById(postId).select("_id");
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const totalComments = await Comment.countDocuments({ post: postId });

    const result = {
      success: true,
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    };

    // Cache for 2 minutes
    await req.redisClient.setex(cacheKey, 120, JSON.stringify(result));

    res.json(result);
  } catch (e) {
    logger.error("Error fetching comments", e);
    res.status(500).json({ success: false, message: "Error fetching comments" });
  }
};

/**
 * Delete a comment (only comment author can delete).
 */
const deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      post: postId,
      user: userId,
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you are not the author",
      });
    }

    // Invalidate comment cache for this post
    const commentKeys = await req.redisClient.keys(`comments:${postId}:*`);
    if (commentKeys.length > 0) await req.redisClient.del(commentKeys);

    logger.info(`Comment ${commentId} deleted from post ${postId} by user ${userId}`);
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (e) {
    logger.error("Error deleting comment", e);
    res.status(500).json({ success: false, message: "Error deleting comment" });
  }
};

module.exports = { addComment, getComments, deleteComment };
