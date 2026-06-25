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
  query("status")
    .optional()
    .isIn(["pending", "submitted", "completed", "rejected"]).withMessage("Invalid status filter"),

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


