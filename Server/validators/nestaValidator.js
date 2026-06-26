const { body, param } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Nesta = require("../models/nestaModel");

exports.createNestaValidator = [
  body("content")
    .trim()
    .notEmpty().withMessage("Content is required")
    .isLength({ max: 1000 }).withMessage("Content cannot exceed 1000 characters"),

  body("isAnonymous")
    .optional()
    .isBoolean().withMessage("isAnonymous must be a boolean"),

  validatorMiddleware,
];

exports.updateNestaValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Nesta ID"),

  body("content")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Content cannot exceed 1000 characters"),

  body("isAnonymous")
    .optional()
    .isBoolean().withMessage("isAnonymous must be a boolean"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.id);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    if (nesta.author._id.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only the post owner can update this post", 403));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.deleteNestaValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Nesta ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.id);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    if (nesta.author._id.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only the post owner can delete this post", 403));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.getNestaValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Nesta ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.id);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.voteValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Nesta ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const nesta = await Nesta.findById(req.params.id);
    if (!nesta) {
      return next(new ApiError("Nesta not found", 404));
    }
    req.nestaDoc = nesta;
    next();
  }),
];

exports.getMyNestasValidator = [
  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    // Validate query parameters
    if (req.query.page && isNaN(req.query.page)) {
      return next(new ApiError("Page must be a number", 400));
    }
    if (req.query.limit && isNaN(req.query.limit)) {
      return next(new ApiError("Limit must be a number", 400));
    }
    if (req.query.sort) {
      const allowedSortFields = ["createdAt", "score", "totalUpVotes"];
      const sortField = req.query.sort.startsWith("-")
        ? req.query.sort.slice(1)
        : req.query.sort;
      if (!allowedSortFields.includes(sortField)) {
        return next(
          new ApiError(
            `Invalid sort field. Allowed: ${allowedSortFields.join(", ")}`,
            400
          )
        );
      }
    }
    next();
  }),
];

exports.getAllNestasValidator = [
  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    if (req.query.page && isNaN(req.query.page)) {
      return next(new ApiError("Page must be a number", 400));
    }
    if (req.query.limit && isNaN(req.query.limit)) {
      return next(new ApiError("Limit must be a number", 400));
    }
    if (req.query.sort) {
      const allowedSortModes = ["top", "new", "controversial"];
      if (!allowedSortModes.includes(req.query.sort)) {
        return next(
          new ApiError(
            `Invalid sort mode. Allowed: ${allowedSortModes.join(", ")}`,
            400
          )
        );
      }
    }
    next();
  }),
];

exports.getUserNestasValidator = [
  param("userId")
    .isMongoId().withMessage("Invalid User ID"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    // Validate query parameters
    if (req.query.page && isNaN(req.query.page)) {
      return next(new ApiError("Page must be a number", 400));
    }
    if (req.query.limit && isNaN(req.query.limit)) {
      return next(new ApiError("Limit must be a number", 400));
    }
    if (req.query.sort) {
      const allowedSortFields = ["createdAt", "score", "totalUpVotes"];
      const sortField = req.query.sort.startsWith("-")
        ? req.query.sort.slice(1)
        : req.query.sort;
      if (!allowedSortFields.includes(sortField)) {
        return next(
          new ApiError(
            `Invalid sort field. Allowed: ${allowedSortFields.join(", ")}`,
            400
          )
        );
      }
    }
    next();
  }),
];

exports.searchNestasValidator = [
  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return next(new ApiError("Search query parameter 'q' is required", 400));
    }

    if (q.trim().length < 2) {
      return next(new ApiError("Search query must be at least 2 characters", 400));
    }

    if (req.query.page && isNaN(req.query.page)) {
      return next(new ApiError("Page must be a number", 400));
    }
    if (req.query.limit && isNaN(req.query.limit)) {
      return next(new ApiError("Limit must be a number", 400));
    }

    next();
  }),
];

