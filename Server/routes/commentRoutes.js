const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  addCommentValidator,
  getCommentsValidator,
  deleteCommentValidator,
} = require("../validators/commentValidator");

// All comment routes require authentication
router.use(authMiddleware);

// POST /api/v1/nestas/:nestaId/comments - add comment
// GET /api/v1/nestas/:nestaId/comments - get all comments
router.route("/")
  .post(addCommentValidator, addComment)
  .get(getCommentsValidator, getComments);
  

// DELETE /api/v1/nestas/:nestaId/comments/:commentId - delete comment
router.delete("/:commentId", deleteCommentValidator, deleteComment);

module.exports = router;