const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB.");

  const Post = mongoose.model("Post", new mongoose.Schema({}, { strict: false }), "posts");

  const posts = await Post.find({});
  console.log("Posts count:", posts.length);
  for (const p of posts) {
    console.log("Post:", p._id, "Content:", p.content, "User:", p.user, "Username:", p.username);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
