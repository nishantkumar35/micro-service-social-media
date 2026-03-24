const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/Refresh-Token");

const genrateToken = async (user) => {
  const payload = {
    id: user._id,
    userId: user._id,
    username: user.username,
    email: user.email,
  };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1day" });

  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt,
  });
    return { accessToken, refreshToken };
};

module.exports = genrateToken;
