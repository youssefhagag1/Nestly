const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../services/notificationService");

// GET /api/v1/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const result = await getUserNotifications(req.user._id, req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
  });
});

// PATCH /api/v1/notifications/:id/read
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await markAsRead(id, req.user._id);

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// PATCH /api/v1/notifications/read-all
exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await markAllAsRead(req.user._id);

  res.status(200).json({
    success: true,
    modifiedCount: result.modifiedCount,
    message: `Marked ${result.modifiedCount} notification(s) as read`,
  });
});

// DELETE /api/v1/notifications/:id
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await deleteNotification(id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});