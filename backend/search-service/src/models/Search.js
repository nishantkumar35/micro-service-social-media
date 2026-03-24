const mongoose = require("mongoose");

const searchPostSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
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
      required: true,
    },
  },
  { timestamps: true },
);

searchPostSchema.index({ content: "text" });  // leave as is

const Search = mongoose.model("Search", searchPostSchema);
module.exports = Search;
