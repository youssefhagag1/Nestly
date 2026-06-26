const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createTask,
  getMyTasks,
  getRoomTasks,
  getTaskById,
  submitTask,
  reviewTask,
  updateTask,
  deleteTask,
  getSubmission,
  deleteSubmission,
} = require("../controllers/taskController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadMultipleImages } = require("../middlewares/uploadImageMiddleware");
const submissionRoutes = require("./submissionRoutes");

const {
  createTaskValidator,
  getRoomTasksValidator,
  getMyTasksValidator,
  getTaskByIdValidator,
  submitTaskValidator,
  reviewTaskValidator,
  updateTaskValidator,
  deleteTaskValidator,
  getSubmissionValidator,
  deleteSubmissionValidator,
} = require("../validators/taskValidator");

// All task routes require authentication
router.use(authMiddleware);

// GET /api/v1/rooms/:roomId/tasks - get tasks for a room
// POST /api/v1/rooms/:roomId/tasks - create a task (father only, up to 5 images)
router.route("/")
  .get(getRoomTasksValidator, getRoomTasks)
  .post(createTaskValidator, uploadMultipleImages("images", 5), createTask);

// GET /api/v1/tasks/my-tasks - get current user's tasks
router.get("/my-tasks", getMyTasksValidator, getMyTasks);

// GET /api/v1/rooms/:roomId/tasks/:taskId - get task by id
// PATCH /api/v1/rooms/:roomId/tasks/:taskId - update task (father can also update attachments)
// DELETE /api/v1/rooms/:roomId/tasks/:taskId - delete task
router.route("/:taskId")
  .get(getTaskByIdValidator, getTaskById)
  .patch(updateTaskValidator, uploadMultipleImages("images", 5), updateTask)
  .delete(deleteTaskValidator, deleteTask);

// Nested submission routes — /api/v1/tasks/:taskId/submissions
router.use("/:taskId/submissions", submissionRoutes);

// Additional submission routes
router.get("/:taskId/submissions/:submissionId", getSubmissionValidator, getSubmission);
router.delete("/:taskId/submissions/:submissionId", deleteSubmissionValidator, deleteSubmission);

module.exports = router;
