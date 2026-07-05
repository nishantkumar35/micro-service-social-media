const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB.");

  // Import model
  const Follow = require("./models/Follow");

  const followerId = "6a4a6221965468013342f2f7";
  const followingId = "69c29c4f30362e339a3ac4a6";

  const follow = await Follow.findOne({
    follower: followerId,
    following: followingId,
  });

  console.log("Found follow document:", follow);
  console.log("isFollowing status:", !!follow);

  await mongoose.disconnect();
}

main().catch(console.error);
