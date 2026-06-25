const { body, param } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const User = require("../models/userModel");

exports.registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 1, max: 100 }).withMessage("Age must be between 1 and 100"),

  body("gender")
    .notEmpty().withMessage("Gender is required")
    .isIn(["male", "female"]).withMessage("Gender must be male or female"),

  body("country")
    .trim()
    .notEmpty().withMessage("Country is required"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone is required"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["parent", "child"]).withMessage("Role must be parent or child"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      return next(new ApiError("Email already exists", 400));
    }
    next();
  }),
];

exports.loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const bcrypt = require("bcryptjs");
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user) {
      return next(new ApiError("Invalid credentials", 400));
    }
    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return next(new ApiError("Invalid credentials", 400));
    }
    if (!user.isVerified) {
      return next(new ApiError("Verify email first", 403));
    }
    req.userDoc = user;
    next();
  }),
];

exports.verifyEmailValidator = [
  param("token")
    .notEmpty().withMessage("Token is required"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const hashToken = require("../utils/hashToken");
    const hashed = hashToken(req.params.token);

    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid token", 400));
    }

    req.userDoc = user;
    next();
  }),
];

exports.enable2FAValidator = [
  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (user.twoFactorEnabled) {
      return next(new ApiError("2FA is already enabled. Disable it first to regenerate.", 400));
    }
    next();
  }),
];

exports.verify2FAValidator = [
  body("userId")
    .notEmpty().withMessage("User ID is required")
    .isMongoId().withMessage("Invalid user ID"),

  body("token")
    .notEmpty().withMessage("2FA token is required"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    req.userDoc = user;
    next();
  }),
];

exports.forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError("User not found", 404));
    }
    req.userDoc = user;
    next();
  }),
];

exports.resetPasswordValidator = [
  param("token")
    .notEmpty().withMessage("Token is required"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const hashToken = require("../utils/hashToken");
    const hashed = hashToken(req.params.token);

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    req.userDoc = user;
    next();
  }),
];