const Notification = require("../models/notificationModel");
const { paginate } = require("./paginationService");

// ==================== INTERNAL CREATE ====================

/**
 * Create a notification
 * @param {Object} data - { recipient, type, title, message, relatedId, relatedModel }
 * @returns {Promise<Object>} Created notification
 */
exports.createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedId,
  relatedModel,
}) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    relatedId,
    relatedModel,
  });
  return notification;
};

// ==================== REUSABLE NOTIFICATION HELPERS ====================

/**
 * Notify father when a son requests to join a room
 */
exports.notifyRoomJoinRequest = async (fatherId, roomName, roomId, requesterName) => {
  return exports.createNotification({
    recipient: fatherId,
    type: "room_invite",
    title: "New Join Request",
    message: `${requesterName} wants to join "${roomName}"`,
    relatedId: roomId,
    relatedModel: "Room",
  });
};

/**
 * Notify son when their room join request is approved
 */
exports.notifyRoomApproval = async (userId, roomName, roomId) => {
  return exports.createNotification({
    recipient: userId,
    type: "room_invite",
    title: "Join Request Approved",
    message: `Your request to join "${roomName}" has been approved`,
    relatedId: roomId,
    relatedModel: "Room",
  });
};

/**
 * Notify son when a new task is assigned to them
 */
exports.notifyTaskAssigned = async (assignedUserId, taskTitle, taskId) => {
  return exports.createNotification({
    recipient: assignedUserId,
    type: "task_assigned",
    title: "New Task Assigned",
    message: `You've been assigned a new task: "${taskTitle}"`,
    relatedId: taskId,
    relatedModel: "Task",
  });
};

/**
 * Notify father when a submission is created for their task
 */
exports.notifySubmissionCreated = async (fatherId, taskTitle, submissionId) => {
  return exports.createNotification({
    recipient: fatherId,
    type: "submission_reviewed",
    title: "New Submission",
    message: `A new submission was uploaded for "${taskTitle}"`,
    relatedId: submissionId,
    relatedModel: "Submission",
  });
};

/**
 * Notify son when their submission is approved
 */
exports.notifySubmissionApproved = async (userId, taskTitle, submissionId) => {
  return exports.createNotification({
    recipient: userId,
    type: "submission_approved",
    title: "Submission Approved",
    message: `Your submission for "${taskTitle}" has been approved`,
    relatedId: submissionId,
    relatedModel: "Submission",
  });
};

/**
 * Notify son when their submission is rejected
 */
exports.notifySubmissionRejected = async (userId, taskTitle, submissionId, comment) => {
  const msg = comment
    ? `Your submission for "${taskTitle}" was rejected: "${comment}"`
    : `Your submission for "${taskTitle}" was rejected`;
  return exports.createNotification({
    recipient: userId,
    type: "submission_rejected",
    title: "Submission Rejected",
    message: msg,
    relatedId: submissionId,
    relatedModel: "Submission",
  });
};

/**
 * Notify son when their submission needs fixes
 */
exports.notifySubmissionNeedsFix = async (userId, taskTitle, submissionId, comment) => {
  const msg = comment
    ? `Your submission for "${taskTitle}" needs fixes: "${comment}"`
    : `Your submission for "${taskTitle}" needs fixes`;
  return exports.createNotification({
    recipient: userId,
    type: "submission_needs_fix",
    title: "Submission Needs Fixes",
    message: msg,
    relatedId: submissionId,
    relatedModel: "Submission",
  });
};

/**
 * Notify nesta author when someone comments on their nesta
 */
exports.notifyNestaComment = async (authorId, commenterName, nestaId) => {
  return exports.createNotification({
    recipient: authorId,
    type: "comment_added",
    title: "New Comment",
    message: `${commenterName} commented on your post`,
    relatedId: nestaId,
    relatedModel: "Comment",
  });
};

// ==================== USER NOTIFICATION QUERIES ====================

/**
 * Get notifications for a user with pagination
 * @param {ObjectId} userId - User ID
 * @param {Object} query - Express query object (page, limit, isRead)
 * @returns {Promise<Object>} Paginated notifications
 */
exports.getUserNotifications = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;

  const filter = { recipient: userId };

  if (query.isRead === "true") {
    filter.isRead = true;
  } else if (query.isRead === "false") {
    filter.isRead = false;
  }

  let notificationsQuery = Notification.find(filter).sort("-createdAt");

  const result = await paginate(notificationsQuery, page, limit);

  return {
    data: result.data,
    pagination: result.pagination,
  };
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};