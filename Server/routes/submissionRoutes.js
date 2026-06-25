const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createSubmission,
  getSubmissions,
  reviewSubmission,
} = require("../controllers/submissionController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadMultipleImages } = require("../middlewares/uploadImageMiddleware");

const {
  createSubmissionValidator,
  getSubmissionsValidator,
  reviewSubmissionValidator,
} = require("../validators/submissionValidator");

// All submission routes require authentication
router.use(authMiddleware);

// POST /api/v1/tasks/:taskId/submissions - submit a submission (up to 5 images)
// GET  /api/v1/tasks/:taskId/submissions - get all submissions for a task
router.route("/")
  .post(createSubmissionValidator, uploadMultipleImages("images", 5), createSubmission)
  .get(getSubmissionsValidator, getSubmissions);

// PATCH /api/v1/submissions/:submissionId/review - review a submission
router.patch("/:submissionId/review", reviewSubmissionValidator, reviewSubmission);


module.exports = router;