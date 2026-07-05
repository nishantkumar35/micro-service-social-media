const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Compound unique index — prevents duplicate follows at DB level
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Index for fast followers/following lookups
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
