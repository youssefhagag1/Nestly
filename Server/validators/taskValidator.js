const { body, param, query } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");
const Task = require("../models/taskModel");

exports.createTaskValidator = [
  param("roomId")
    .notEmpty().withMessage("Room ID is required")
    .isMongoId().withMessage("Invalid room ID"),

  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 2, max: 100 }).withMessage("Title must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),

  body("assignedTo")
    .notEmpty().withMessage("Assigned user is required")
    .isMongoId().withMessage("Invalid assigned user ID"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Due date must be a valid date"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const roomId = req.params.roomId || req.body.roomId;

    const room = await Room.findById(roomId);
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }
    if (room.fatherId.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only father can create tasks", 403));
    }
    req.roomDoc = room;

    const member = await RoomMember.findOne({
      roomId,
      userId: req.body.assignedTo,
      status: "approved",
    });
    if (!member) {
      return next(new ApiError("Assigned user is not a room member", 400));
    }

    next();
  }),
];

exports.getRoomTasksValidator = [
  param("roomId")
    .notEmpty().withMessage("Room ID is required")
    .isMongoId().withMessage("Invalid room ID"),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["pending", "submitted", "completed", "rejected"]).withMessage("Invalid status filter"),

  query("sort")
    .optional()
    .isIn(["createdAt", "-createdAt", "dueDate", "-dueDate", "title", "-title"]).withMessage("Invalid sort field"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }
    next();
  }),
];

exports.getMyTasksValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["pending", "submitted", "completed", "rejected"]).withMessage("Invalid status filter"),

  query("sort")
    .optional()
    .isIn(["createdAt", "-createdAt", "dueDate", "-dueDate", "title", "-title"]).withMessage("Invalid sort field"),

  validatorMiddleware,
];

exports.getTaskByIdValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.taskId)
      .populate("createdBy")
      .populate("assignedTo")
      .populate("roomId", "name");
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const isCreator =
      task.createdBy._id.toString() === req.user._id.toString();
    const isAssigned =
      task.assignedTo._id.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned) {
      return next(new ApiError("Not allowed", 403));
    }

    req.taskDoc = task;
    next();
  }),
];

exports.updateTaskValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Title must be between 2 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description must be less than 500 characters"),

  body("assignedTo")
    .optional()
    .isMongoId().withMessage("Invalid assigned user ID"),

  body("dueDate")
    .optional()
    .isISO8601().withMessage("Due date must be a valid date"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const room = await Room.findById(task.roomId);
    if (room.fatherId.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only father", 403));
    }
    if (task.status !== "pending") {
      return next(new ApiError("Task locked", 400));
    }

    req.taskDoc = task;
    next();
  }),
];

exports.deleteTaskValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const room = await Room.findById(task.roomId);
    if (room.fatherId.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only father", 403));
    }

    req.taskDoc = task;
    next();
  }),
];

// ================= SUBMISSION VALIDATORS =================

exports.getSubmissionValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  param("submissionId")
    .notEmpty().withMessage("Submission ID is required")
    .isMongoId().withMessage("Invalid submission ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return next(new ApiError("Submission not found", 404));
    }

    // Verify submission belongs to the task
    if (submission.taskId.toString() !== req.params.taskId) {
      return next(new ApiError("Submission does not belong to this task", 404));
    }

    // Check if user is authorized (task creator, assigned user, or father)
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const room = await Room.findById(task.roomId);
    const isFather = room.fatherId.toString() === req.user._id.toString();

    if (!isCreator && !isAssigned && !isFather) {
      return next(new ApiError("Not authorized to view this submission", 403));
    }

    next();
  }),
];

exports.deleteSubmissionValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  param("submissionId")
    .notEmpty().withMessage("Submission ID is required")
    .isMongoId().withMessage("Invalid submission ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return next(new ApiError("Submission not found", 404));
    }

    // Verify submission belongs to the task
    if (submission.taskId.toString() !== req.params.taskId) {
      return next(new ApiError("Submission does not belong to this task", 404));
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const room = await Room.findById(task.roomId);
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }

    const isOwner = submission.submittedBy.toString() === req.user._id.toString();
    const isFather = room.fatherId.toString() === req.user._id.toString();

    // Check permissions
    if (!isOwner && !isFather) {
      return next(new ApiError("Not authorized to delete this submission", 403));
    }

    if (isOwner && submission.status !== "pending") {
      return next(new ApiError("Cannot delete submission after review has started", 400));
    }

    next();
  }),
];


