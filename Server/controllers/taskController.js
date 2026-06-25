const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const Task = require("../models/taskModel");
const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");

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

  res.status(201).json({
    success: true,
    task,
  });
});


exports.getRoomTasks = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;

  const tasks = await Task.find({ roomId })
    .populate("assignedTo", "name")
    .populate("createdBy", "name")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});


exports.getMyTasks = asyncHandler(async (req, res) => {
  const filter = {
    assignedTo: req.user._id,
  };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const tasks = await Task.find(filter)
    .populate("createdBy", "name")
    .populate("roomId", "name")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
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
