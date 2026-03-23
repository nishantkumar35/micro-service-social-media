const express = require("express");
const {
  register,
  loginUser,
  refreshTokenUser,
  logoutUser,
} = require("../controllers/user-controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/logout", logoutUser);

module.exports = router;