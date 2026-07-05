const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post-controllers");
const { likePost, getLikes } = require("../controllers/like-controller");
const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/comment-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

const router = express.Router();

//middleware → this will tell if the user is an auth user or not
router.use(authenticateRequest);

// ── Post CRUD ────────────────────────────────────────────────────────────────
router.post("/create-post", createPost);
router.get("/all-posts", getAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

// ── Likes ────────────────────────────────────────────────────────────────────
router.post("/:id/like", likePost);       // toggle like/unlike
router.get("/:id/likes", getLikes);       // get likes count + list

// ── Comments ─────────────────────────────────────────────────────────────────
router.post("/:id/comments", addComment);                    // add comment
router.get("/:id/comments", getComments);                    // get paginated comments
router.delete("/:id/comments/:commentId", deleteComment);    // delete own comment

module.exports = router;