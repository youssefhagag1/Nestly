 const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Submission = require("../models/submissionModel");
const Task = require("../models/taskModel");
const Room = require("../models/roomModel");

// POST /api/v1/tasks/:taskId/submissions
exports.createSubmission = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { note } = req.body;

  if (!req.files || req.files.length === 0) {
    return next(new ApiError("At least one image is required", 400));
  }

  const { processMultipleImages } = require("../utils/imageProcessing");
  const imageUrls = await processMultipleImages(req.files, "submissions");

  const submission = await Submission.create({
    taskId,
    submittedBy: req.user._id,
    images: imageUrls,
    note: note || "",
  });

  // Notify father about the new submission
  const Task = require("../models/taskModel");
  const Room = require("../models/roomModel");
  const task = await Task.findById(taskId);
  if (task) {
    const room = await Room.findById(task.roomId);
    if (room) {
      const { notifySubmissionCreated } = require("../services/notificationService");
      await notifySubmissionCreated(room.fatherId, task.title, submission._id);
    }
  }

  res.status(201).json({
    success: true,
    submission,
  });
});

// GET /api/v1/tasks/:taskId/submissions
exports.getSubmissions = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;

  const submissions = await Submission.find({ taskId })
    .populate("submittedBy", "name email")
    .populate("review.reviewedBy", "name")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: submissions.length,
    submissions,
  });
});

// PATCH /api/v1/submissions/:submissionId/review
exports.reviewSubmission = asyncHandler(async (req, res, next) => {
  const { status, comment } = req.body;

  const submission = req.submissionDoc;

  submission.status = status;
  submission.review = {
    comment: comment || "",
    reviewedBy: req.user._id,
    reviewedAt: Date.now(),
  };

  await submission.save();

  // Notify submitter about review result
  const Task = require("../models/taskModel");
  const task = await Task.findById(submission.taskId);
  const taskTitle = task ? task.title : "the task";

  const {
    notifySubmissionApproved,
    notifySubmissionRejected,
    notifySubmissionNeedsFix,
  } = require("../services/notificationService");

  if (status === "approved") {
    await notifySubmissionApproved(submission.submittedBy, taskTitle, submission._id);
  } else if (status === "rejected") {
    await notifySubmissionRejected(submission.submittedBy, taskTitle, submission._id, comment);
  } else if (status === "needs_fix") {
    await notifySubmissionNeedsFix(submission.submittedBy, taskTitle, submission._id, comment);
  }

  res.status(200).json({
    success: true,
    submission,
  });
});

// POST /api/v1/tasks/:taskId/submissions/:submissionId/resubmit
exports.resubmitSubmission = asyncHandler(async (req, res, next) => {
  const { submissionId } = req.params;
  const { note } = req.body;
  const { resubmitSubmission } = require("../services/submissionService");

  if (!req.files || req.files.length === 0) {
    return next(new ApiError("At least one image is required", 400));
  }

  const submission = await resubmitSubmission(
    submissionId,
    req.user._id,
    req.files,
    note
  );

  res.status(200).json({
    success: true,
    submission,
  });
});
