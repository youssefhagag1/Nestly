const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getNotificationsValidator,
  markAsReadValidator,
  deleteNotificationValidator,
} = require("../validators/notificationValidator");

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/v1/notifications - get all notifications for current user
router.get("/", getNotificationsValidator, getNotifications);

// PATCH /api/v1/notifications/read-all - mark all notifications as read
router.patch("/read-all", markAllNotificationsAsRead);

// PATCH /api/v1/notifications/:id/read - mark single notification as read
router.patch("/:id/read", markAsReadValidator, markNotificationAsRead);

// DELETE /api/v1/notifications/:id - delete a notification
router.delete("/:id", deleteNotificationValidator, deleteNotification);

module.exports = router;