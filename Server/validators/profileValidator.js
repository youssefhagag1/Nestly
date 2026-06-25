const { body } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

const ALLOWED_PROFILE_FIELDS = ["name", "age", "gender", "country", "phone", "bio"];

exports.ALLOWED_PROFILE_FIELDS = ALLOWED_PROFILE_FIELDS;

exports.updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("age")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Age must be between 1 and 100"),

  body("gender")
    .optional()
    .isIn(["male", "female"]).withMessage("Gender must be male or female"),

  body("country")
    .optional()
    .trim()
    .notEmpty().withMessage("Country cannot be empty"),

  body("phone")
    .optional()
    .trim()
    .notEmpty().withMessage("Phone cannot be empty"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Bio must be less than 300 characters"),

  validatorMiddleware,

  (req, res, next) => {
    const hasUpdates = ALLOWED_PROFILE_FIELDS.some(field => req.body[field] !== undefined);
    if (!hasUpdates) {
      return next(new ApiError("No valid fields to update", 400));
    }
    next();
  },
];

exports.changePasswordValidator = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isMatch) {
      return next(new ApiError("Current password is incorrect", 401));
    }
    req.userToChangePassword = user; // Store user for password change in controller
    next();
  }),
];

exports.deleteAccountValidator = [
  body("password")
    .notEmpty().withMessage("Password is required to delete account"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return next(new ApiError("Password is incorrect", 401));
    }
    req.userToDelete = user; // Store user for deletion in controller
    next();
  }),
];