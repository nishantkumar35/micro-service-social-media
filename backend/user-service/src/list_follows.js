const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB.");

  const Follow = mongoose.model("Follow", new mongoose.Schema({}, { strict: false }), "follows");
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");

  const follows = await Follow.find({});
  console.log("Follows count:", follows.length);
  for (const f of follows) {
    console.log("Follow:", f);
  }

  const users = await User.find({});
  console.log("Users count:", users.length);
  for (const u of users) {
    console.log("User:", u._id, u.username);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
