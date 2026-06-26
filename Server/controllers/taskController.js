const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const Task = require("../models/taskModel");
const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");
const Submission = require("../models/submissionModel");
const { buildFilter, buildSort, paginate } = require("../services/paginationService");

exports.createTask = asyncHandler(async (req, res, next) => {
  const roomId = req.params.roomId || req.body.roomId;
  const {
    title,
    description,
    assignedTo,
    dueDate,
  } = req.body;

  const taskData = {
    roomId,
    title,
    description,
    assignedTo,
    createdBy: req.user._id,
    dueDate,
  };

  // Process images if provided (father's reference images)
  if (req.files && req.files.length > 0) {
    const { processMultipleImages } = require("../utils/imageProcessing");
    const imageUrls = await processMultipleImages(req.files, "tasks");
    taskData.attachments = imageUrls;
  }

  const task = await Task.create(taskData);

  // Notify the assigned user about the new task
  if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
    const { notifyTaskAssigned } = require("../services/notificationService");
    await notifyTaskAssigned(task.assignedTo, task.title, task._id);
  }

  res.status(201).json({
    success: true,
    task,
  });
});


exports.getRoomTasks = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;

  // Build filter
  const allowedFilters = ["status"];
  const filter = buildFilter({ roomId }, req.query, allowedFilters);

  // Build sort
  const allowedSortFields = ["createdAt", "dueDate", "title"];
  const sort = buildSort(req.query, allowedSortFields, "-createdAt");

  // Build query
  const query = Task.find(filter)
    .populate("assignedTo", "name")
    .populate("createdBy", "name")
    .sort(sort);

  // Paginate
  const { data, pagination } = await paginate(query, req.query.page, req.query.limit);

  res.status(200).json({
    success: true,
    pagination,
    data,
  });
});


exports.getMyTasks = asyncHandler(async (req, res) => {
  // Build filter
  const allowedFilters = ["status"];
  const filter = buildFilter({ assignedTo: req.user._id }, req.query, allowedFilters);

  // Build sort
  const allowedSortFields = ["createdAt", "dueDate", "title"];
  const sort = buildSort(req.query, allowedSortFields, "-createdAt");

  // Build query
  const query = Task.find(filter)
    .populate("createdBy", "name")
    .populate("roomId", "name")
    .sort(sort);

  // Paginate
  const { data, pagination } = await paginate(query, req.query.page, req.query.limit);

  res.status(200).json({
    success: true,
    pagination,
    data,
  });
});


exports.getTaskById = asyncHandler(async (req, res, next) => {
  const task = req.taskDoc;

  res.status(200).json({
    success: true,
    task,
  });
});




exports.updateTask = asyncHandler(async (req, res, next) => {
  const task = req.taskDoc;

  // Update text fields from body
  const allowedFields = ["title", "description", "assignedTo", "dueDate"];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  }

  // If new images are uploaded, replace attachments (father only via validator)
  if (req.files && req.files.length > 0) {
    // Delete old attachment files from disk
    for (const url of task.attachments) {
      const filePath = path.join(__dirname, "..", url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const { processMultipleImages } = require("../utils/imageProcessing");
    const imageUrls = await processMultipleImages(req.files, "tasks");
    task.attachments = imageUrls;
  }

  await task.save();

  res.status(200).json({ success: true, task });
});

exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = req.taskDoc;

  await task.deleteOne();

  res.json({ success: true, message: "Task deleted" });
});

// ================= SUBMISSION MANAGEMENT =================

// GET /api/v1/tasks/:taskId/submissions/:submissionId - Get submission details
exports.getSubmission = asyncHandler(async (req, res, next) => {
  const { taskId, submissionId } = req.params;

  const submission = await Submission.findById(submissionId)
    .populate("submittedBy", "name email");

  if (!submission) {
    return next(new ApiError("Submission not found", 404));
  }

  // Verify submission belongs to the task
  if (submission.taskId.toString() !== taskId) {
    return next(new ApiError("Submission does not belong to this task", 404));
  }

  res.status(200).json({
    success: true,
    submission,
  });
});

// DELETE /api/v1/tasks/:taskId/submissions/:submissionId - Delete submission
exports.deleteSubmission = asyncHandler(async (req, res, next) => {
  const { taskId, submissionId } = req.params;

  const submission = await Submission.findById(submissionId);
  
  if (!submission) {
    return next(new ApiError("Submission not found", 404));
  }

  // Verify submission belongs to the task
  if (submission.taskId.toString() !== taskId) {
    return next(new ApiError("Submission does not belong to this task", 404));
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return next(new ApiError("Task not found", 404));
  }

  const room = await Room.findById(task.roomId);
  if (!room) {
    return next(new ApiError("Room not found", 404));
  }

  const isOwner = submission.submittedBy.toString() === req.user._id.toString();
  const isFather = room.fatherId.toString() === req.user._id.toString();

  // Check permissions: owner can delete before review, father can delete anytime
  if (!isOwner && !isFather) {
    return next(new ApiError("Not authorized to delete this submission", 403));
  }

  if (isOwner && submission.status !== "pending") {
    return next(new ApiError("Cannot delete submission after review has started", 400));
  }

  // Delete submission images from filesystem
  if (submission.images && submission.images.length > 0) {
    for (const imageUrl of submission.images) {
      const imagePath = path.join(__dirname, "..", imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  }

  await Submission.findByIdAndDelete(submissionId);

  res.status(200).json({
    success: true,
    message: "Submission deleted successfully",
  });
});
