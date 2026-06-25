const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Nesta = require("../models/nestaModel");

// Helper to sanitize anonymous nesta responses
const sanitizeNesta = (nesta) => {
  const obj = nesta.toJSON();

  if (obj.isAnonymous) {
    obj.author = "Anonymous";
  }

  obj.totalUpVotes = obj.upVotes ? obj.upVotes.length : 0;
  obj.totalDownVotes = obj.downVotes ? obj.downVotes.length : 0;
  obj.score = obj.totalUpVotes - obj.totalDownVotes;

  return obj;
};

// ================= CREATE NESTA =================
exports.createNesta = asyncHandler(async (req, res) => {
  const { content, isAnonymous } = req.body;

  const nesta = await Nesta.create({
    author: req.user._id,
    content,
    isAnonymous: isAnonymous || false,
  });

  res.status(201).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= GET ALL NESTAS =================
exports.getAllNestas = asyncHandler(async (req, res) => {
  const nestas = await Nesta.find().sort("-createdAt");

  const sanitized = nestas.map((n) => sanitizeNesta(n));

  res.status(200).json({
    success: true,
    count: sanitized.length,
    data: sanitized,
  });
});

// ================= GET SINGLE NESTA =================
exports.getSingleNesta = asyncHandler(async (req, res) => {
  const nesta = req.nestaDoc;

  res.status(200).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= UPDATE NESTA =================
exports.updateNesta = asyncHandler(async (req, res) => {
  const { content, isAnonymous } = req.body;
  const nesta = req.nestaDoc;

  if (content !== undefined) nesta.content = content;
  if (isAnonymous !== undefined) nesta.isAnonymous = isAnonymous;

  await nesta.save();

  res.status(200).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= DELETE NESTA =================
exports.deleteNesta = asyncHandler(async (req, res) => {
  const nesta = req.nestaDoc;

  await nesta.deleteOne();

  res.status(200).json({
    success: true,
    message: "Nesta deleted successfully",
  });
});

// ================= UPVOTE NESTA =================
exports.upVoteNesta = asyncHandler(async (req, res, next) => {
  const nesta = req.nestaDoc;
  const userId = req.user._id;

  // Check if user already upvoted
  const alreadyUpvoted = nesta.upVotes.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyUpvoted) {
    return next(new ApiError("You have already upvoted this post", 400));
  }

  // If user had downvoted, remove downvote first
  const downVoteIndex = nesta.downVotes.findIndex(
    (id) => id.toString() === userId.toString()
  );
  if (downVoteIndex !== -1) {
    nesta.downVotes.splice(downVoteIndex, 1);
  }

  nesta.upVotes.push(userId);
  await nesta.save();

  res.status(200).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= DOWNVOTE NESTA =================
exports.downVoteNesta = asyncHandler(async (req, res, next) => {
  const nesta = req.nestaDoc;
  const userId = req.user._id;

  // Check if user already downvoted
  const alreadyDownvoted = nesta.downVotes.some(
    (id) => id.toString() === userId.toString()
  );
  if (alreadyDownvoted) {
    return next(new ApiError("You have already downvoted this post", 400));
  }

  // If user had upvoted, remove upvote first
  const upVoteIndex = nesta.upVotes.findIndex(
    (id) => id.toString() === userId.toString()
  );
  if (upVoteIndex !== -1) {
    nesta.upVotes.splice(upVoteIndex, 1);
  }

  nesta.downVotes.push(userId);
  await nesta.save();

  res.status(200).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

