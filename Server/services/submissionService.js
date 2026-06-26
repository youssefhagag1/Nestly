const path = require("path");
const fs = require("fs");
const Submission = require("../models/submissionModel");
const Task = require("../models/taskModel");
const { processMultipleImages } = require("../utils/imageProcessing");

/**
 * Resubmit a submission that was marked as needs_fix
 * @param {ObjectId} submissionId - Submission ID
 * @param {ObjectId} userId - User ID (must be assigned user)
 * @param {Array} files - Multer file array
 * @param {String} note - Optional note
 * @returns {Promise<Object>} Updated submission
 */
exports.resubmitSubmission = async (submissionId, userId, files, note) => {
  const submission = await Submission.findById(submissionId).populate("taskId");

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Verify the submission is in needs_fix status
  if (submission.status !== "needs_fix") {
    throw new Error("Only submissions with status 'needs_fix' can be resubmitted");
  }

  // Verify the user is the assigned user for the task
  const task = submission.taskId;
  if (task.assignedTo.toString() !== userId.toString()) {
    throw new Error("Not allowed to resubmit for this task");
  }

  // Verify at least one image is provided
  if (!files || files.length === 0) {
    throw new Error("At least one image is required");
  }

  // Delete previously uploaded images from filesystem
  if (submission.images && submission.images.length > 0) {
    submission.images.forEach((imagePath) => {
      // imagePath is relative like "/uploads/submissions/uuid.jpeg"
      const fullPath = path.join(__dirname, "..", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });
  }

  // Process new images
  const imageUrls = await processMultipleImages(files, "submissions");

  // Update submission: replace images, reset status to pending, clear review
  submission.images = imageUrls;
  submission.status = "pending";
  submission.note = note || submission.note;
  submission.review = {
    comment: "",
    reviewedBy: undefined,
    reviewedAt: undefined,
  };

  await submission.save();

  return submission;
};