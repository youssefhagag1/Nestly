const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Comment = require("../models/commentModel");
const Nesta = require("../models/nestaModel");
const { getNestaComments, updateComment } = require("../services/commentService");

// Helper to sanitize comment response
const sanitizeComment = (comment) => {
  const obj = comment.toJSON();
  if (obj.isAnonymous) {
    obj.user = "Anonymous";
  }
  return obj;
};

// POST /api/v1/nestas/:nestaId/comments - add comment
exports.addComment = asyncHandler(async (req, res) => {
  const { content, isAnonymous } = req.body;

  const comment = await Comment.create({
    nestaId: req.nestaDoc._id,
    user: req.user._id,
    content,
    isAnonymous: isAnonymous || false,
  });

  // Notify nesta author about the new comment (skip if commenting on own post)
  const nesta = req.nestaDoc;
  if (nesta.author._id.toString() !== req.user._id.toString()) {
    const { notifyNestaComment } = require("../services/notificationService");
    const commenterName = isAnonymous ? "Someone" : (req.user.name || "Someone");
    await notifyNestaComment(nesta.author._id, commenterName, nesta._id);
  }

  res.status(201).json({
    success: true,
    data: sanitizeComment(comment),
  });
});

// GET /api/v1/nestas/:nestaId/comments - get all comments for a nesta
exports.getComments = asyncHandler(async (req, res) => {
  const result = await getNestaComments(req.nestaDoc._id, req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
  });
});

// PATCH /api/v1/nestas/:nestaId/comments/:commentId - edit comment
exports.editComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  const updatedComment = await updateComment(
    commentId,
    req.user._id,
    content
  );

  res.status(200).json({
    success: true,
    data: updatedComment,
  });
});

// DELETE /api/v1/nestas/:nestaId/comments/:commentId - delete comment
exports.deleteComment = asyncHandler(async (req, res) => {
  await req.commentDoc.deleteOne();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});
