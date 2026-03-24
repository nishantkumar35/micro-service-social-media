const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
      default: "",
    },
    mediaIds: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

postSchema.index({ content: "text" });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
