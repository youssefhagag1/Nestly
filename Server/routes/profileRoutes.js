const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  changePassword,
  deleteMyAccount,
} = require("../controllers/profileController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const {
  updateProfileValidator,
  changePasswordValidator,
  deleteAccountValidator,
} = require("../validators/profileValidator");

// All profile routes require authentication
router.use(authMiddleware);

// GET /api/v1/profile/me - get current user's profile
// PATCH /api/v1/profile/me - update profile
// DELETE /api/v1/profile/me - delete account
router.route("/me")
  .get(getMyProfile)
  .patch(updateProfileValidator, updateMyProfile)
  .delete(deleteAccountValidator, deleteMyAccount);

// PATCH /api/v1/profile/me/image - upload profile image
router.patch("/me/image", uploadSingleImage("image"), uploadProfileImage);

// PATCH /api/v1/profile/change-password - change password
router.patch("/change-password", changePasswordValidator, changePassword);

module.exports = router;