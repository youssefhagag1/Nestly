const { body, param } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Nesta = require("../models/nestaModel");
const Comment = require("../models/commentModel");

exports.addCommentValidator = [
  param("nestaId")
    .isMongoId().withMessage("Invalid Nesta ID"),

  body("content")
    .trim()
    .notEmpty().withMessage("Comment content is required")
    .isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),

  body("isAnonymous")
    .optional()
    .isBoolean().withMessage("isAnonymous must be a boolean"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.nestaId);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.getCommentsValidator = [
  param("nestaId")
    .isMongoId().withMessage("Invalid Nesta ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.nestaId);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.deleteCommentValidator = [
  param("nestaId")
    .isMongoId().withMessage("Invalid Nesta ID"),

  param("commentId")
    .isMongoId().withMessage("Invalid Comment ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ApiError("Comment not found", 404));
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only the comment owner can delete this comment", 403));
    }
    req.commentDoc = comment;
    next();
  }),
];

exports.editCommentValidator = [
  param("nestaId")
    .isMongoId().withMessage("Invalid Nesta ID"),

  param("commentId")
    .isMongoId().withMessage("Invalid Comment ID"),

  body("content")
    .trim()
    .notEmpty().withMessage("Comment content is required")
    .isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(new ApiError("Comment not found", 404));
    }
    if (comment.nestaId.toString() !== req.params.nestaId) {
      return next(new ApiError("Comment does not belong to this nesta", 404));
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only the comment owner can edit this comment", 403));
    }
    req.commentDoc = comment;
    next();
  }),
];
