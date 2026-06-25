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

  res.status(200).json({
    success: true,
    submission,
  });
});