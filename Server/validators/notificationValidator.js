const { param } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Notification = require("../models/notificationModel");

exports.getNotificationsValidator = [
  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    if (req.query.page && isNaN(req.query.page)) {
      return next(new ApiError("Page must be a number", 400));
    }
    if (req.query.limit && isNaN(req.query.limit)) {
      return next(new ApiError("Limit must be a number", 400));
    }
    if (req.query.isRead && !["true", "false"].includes(req.query.isRead)) {
      return next(new ApiError("isRead must be 'true' or 'false'", 400));
    }
    next();
  }),
];

exports.markAsReadValidator = [
  param("id")
    .isMongoId().withMessage("Invalid notification ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(new ApiError("Notification not found", 404));
    }
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return next(new ApiError("Not authorized to access this notification", 403));
    }
    next();
  }),
];

exports.deleteNotificationValidator = [
  param("id")
    .isMongoId().withMessage("Invalid notification ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(new ApiError("Notification not found", 404));
    }
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return next(new ApiError("Not authorized to delete this notification", 403));
    }
    next();
  }),
];