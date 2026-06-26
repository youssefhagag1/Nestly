const { body, param } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Task = require("../models/taskModel");
const Submission = require("../models/submissionModel");
const Room = require("../models/roomModel");

exports.createSubmissionValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must be less than 300 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ApiError("Not allowed to submit for this task", 403));
    }
    req.taskDoc = task;
    next();
  }),
];

exports.getSubmissionsValidator = [
  param("taskId")
    .notEmpty().withMessage("Task ID is required")
    .isMongoId().withMessage("Invalid task ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return next(new ApiError("Task not found", 404));
    }

    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const room = await Room.findById(task.roomId);
    const isFather = room && room.fatherId.toString() === req.user._id.toString();

    if (!isAssigned && !isFather) {
      return next(new ApiError("Not allowed", 403));
    }

    next();
  }),
];

exports.reviewSubmissionValidator = [
  param("submissionId")
    .notEmpty().withMessage("Submission ID is required")
    .isMongoId().withMessage("Invalid submission ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["approved", "rejected", "needs_fix"]).withMessage("Status must be approved, rejected, or needs_fix"),

  body("comment")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Comment must be less than 500 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const submission = await Submission.findById(req.params.submissionId).populate("taskId");
    if (!submission) {
      return next(new ApiError("Submission not found", 404));
    }

    const task = submission.taskId;
    const room = await Room.findById(task.roomId);

    if (!room || room.fatherId.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only father can review submissions", 403));
    }

    req.submissionDoc = submission;
    next();
  }),
];

exports.resubmitSubmissionValidator = [
  param("submissionId")
    .notEmpty().withMessage("Submission ID is required")
    .isMongoId().withMessage("Invalid submission ID"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage("Note must be less than 300 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const submission = await Submission.findById(req.params.submissionId).populate("taskId");
    if (!submission) {
      return next(new ApiError("Submission not found", 404));
    }

    if (submission.status !== "needs_fix") {
      return next(new ApiError("Only submissions with status 'needs_fix' can be resubmitted", 400));
    }

    const task = submission.taskId;
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return next(new ApiError("Not allowed to resubmit for this task", 403));
    }

    req.submissionDoc = submission;
    next();
  }),
];
