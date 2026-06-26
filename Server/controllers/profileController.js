const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");
const { ALLOWED_PROFILE_FIELDS } = require("../validators/profileValidator");

// GET /api/v1/profile/me
exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-emailVerifyToken -emailVerifyExpire -passwordResetToken -passwordResetExpire -twoFactorSecret");

  res.status(200).json({
    success: true,
    user,
  });
});

// PATCH /api/v1/profile/me
exports.uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No image provided", 400));
  }

  const { processSingleImage } = require("../utils/imageProcessing");
  const imageUrl = await processSingleImage(req.file, "users");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { image: imageUrl },
    { new: true }
  ).select("-emailVerifyToken -emailVerifyExpire -passwordResetToken -passwordResetExpire -twoFactorSecret");

  res.status(200).json({
    success: true,
    user,
  });
});

// PATCH /api/v1/profile/me
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
  const updates = {};

  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-emailVerifyToken -emailVerifyExpire -passwordResetToken -passwordResetExpire -twoFactorSecret");

  res.status(200).json({
    success: true,
    user,
  });
});

// PATCH /api/v1/profile/change-password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  const user = req.userToChangePassword;

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// DELETE /api/v1/profile/me/image
exports.deleteProfileImage = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user.image) {
    return next(new ApiError("No profile image to delete", 400));
  }

  // Delete image file from filesystem
  const fs = require("fs");
  const path = require("path");
  const imagePath = path.join(__dirname, "..", "..", user.image);

  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  // Remove image from database
  user.image = "";
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile image deleted successfully",
    user,
  });
});

// DELETE /api/v1/profile/me
exports.deleteMyAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
