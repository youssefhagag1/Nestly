const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const hashToken = require("../utils/hashToken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens");

// ================= REGISTER =================
exports.register = asyncHandler(async (req, res, next) => {
  const { name, age, gender, country, phone, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 12);

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const hashedVerifyToken = hashToken(verifyToken);

  await User.create({
    name,
    age,
    gender,
    country,
    phone,
    email,
    password: hashedPassword,
    role,
    emailVerifyToken: hashedVerifyToken,
    emailVerifyExpire: Date.now() + 1000 * 60 * 30,
  });

  const link = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Verify your email: ${link}`,
  });

  res.status(201).json({ message: "Check your email to verify account" });
});

// ================= VERIFY EMAIL =================
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = req.userDoc;

  user.isVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpire = undefined;

  await user.save();

  res.json({ message: "Email verified successfully" });
});

// ================= LOGIN =================
exports.login = asyncHandler(async (req, res, next) => {
  const user = req.userDoc;

  // if 2FA enabled → stop login
  if (user.twoFactorEnabled) {
    return res.json({
      twoFactorRequired: true,
      userId: user._id,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ message: "Logged in" });
});

// ================= ENABLE 2FA (REAL) =================
exports.enable2FA = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const secret = speakeasy.generateSecret({
    name: `Nestly (${user.email})`,
  });

  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = true;

  await user.save();

  const qr = await qrcode.toDataURL(secret.otpauth_url);

  res.json({
    message: "Scan QR with Google Authenticator",
    qr,
  });
});

// ================= VERIFY 2FA =================
exports.verify2FA = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  const user = req.userDoc;

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified)
    return next(new ApiError("Invalid 2FA code", 400));

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ message: "2FA login success" });
});

// ================= REFRESH TOKEN =================
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new ApiError("User not found", 404));

  const accessToken = generateAccessToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.json({ message: "Token refreshed" });
});

// ================= FORGOT PASSWORD =================
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = req.userDoc;

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Password Reset",
    text: `Reset your password: ${resetUrl}`,
  });

  res.status(200).json({
    message: "Password reset link sent to email",
  });
});

// ================= RESET PASSWORD =================
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = req.userDoc;

  user.password = await bcrypt.hash(password, 12);

  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();

  // Auto Login
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      message: "Password reset successfully",
    });
});

// ================= RESEND EMAIL VERIFICATION =================
exports.resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = req.userDoc;

  if (user.isVerified) {
    return next(new ApiError("Email is already verified", 400));
  }

  // Invalidate old token by setting new one
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const hashedVerifyToken = hashToken(verifyToken);

  user.emailVerifyToken = hashedVerifyToken;
  user.emailVerifyExpire = Date.now() + 1000 * 60 * 30; // 30 minutes

  await user.save();

  const link = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    text: `Verify your email: ${link}`,
  });

  res.status(200).json({ message: "Verification email sent successfully" });
});

// ================= GET 2FA STATUS =================
exports.get2FAStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("twoFactorEnabled");

  res.status(200).json({
    success: true,
    twoFactorEnabled: user.twoFactorEnabled,
  });
});

// ================= DISABLE 2FA =================
exports.disable2FA = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id).select("+password");

  // Verify current password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new ApiError("Current password is incorrect", 401));
  }

  // Remove 2FA secret and disable 2FA
  user.twoFactorSecret = undefined;
  user.twoFactorEnabled = false;

  await user.save();

  res.status(200).json({
    success: true,
    message: "2FA disabled successfully",
  });
});

// ================= LOGOUT =================
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ message: "Logged out" });
});
