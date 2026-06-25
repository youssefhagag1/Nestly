const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Comment = require("../models/commentModel");
const Nesta = require("../models/nestaModel");

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

  res.status(201).json({
    success: true,
    data: sanitizeComment(comment),
  });
});

// GET /api/v1/nestas/:nestaId/comments - get all comments for a nesta
exports.getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ nestaId: req.nestaDoc._id })
    .sort("-createdAt");

  const sanitized = comments.map((c) => sanitizeComment(c));

  res.status(200).json({
    success: true,
    count: sanitized.length,
    data: sanitized,
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
