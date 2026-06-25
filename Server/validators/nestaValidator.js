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

