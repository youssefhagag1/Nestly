const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  enable2FA,
  verify2FA,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");
const refreshMiddleware = require("../middlewares/refreshMiddleware");

const {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  enable2FAValidator,
  verify2FAValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/authValidator");

// auth
router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

// email verification
router.get("/verify-email/:token", verifyEmailValidator, verifyEmail);

// refresh token rotation
router.post("/refresh-token", refreshMiddleware, refreshToken);

// logout
router.post("/logout", logout);

// 2FA
router.post("/2fa/enable", authMiddleware, enable2FAValidator, enable2FA);
router.post("/2fa/verify", verify2FAValidator, verify2FA);

router.post("/forgot-password", forgotPasswordValidator, forgotPassword);
router.patch("/reset-password/:token", resetPasswordValidator, resetPassword);

module.exports = router;