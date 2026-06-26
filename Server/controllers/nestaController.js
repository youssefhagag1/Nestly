const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const Nesta = require("../models/nestaModel");
const {
  getUserNestas,
  getMyNestas,
  getAllNestas,
  searchNestas,
} = require("../services/nestaService");
const { processMultipleImages } = require("../utils/imageProcessing");

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

  // Process uploaded images if any
  let images = [];
  if (req.files && req.files.length > 0) {
    images = await processMultipleImages(req.files, "nestas");
  }

  const nesta = await Nesta.create({
    author: req.user._id,
    content,
    isAnonymous: isAnonymous || false,
    images,
  });

  res.status(201).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= GET ALL NESTAS =================
exports.getAllNestas = asyncHandler(async (req, res) => {
  const result = await getAllNestas(req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
  });
});

// ================= GET MY NESTAS =================
exports.getMyNestas = asyncHandler(async (req, res) => {
  const result = await getMyNestas(req.user._id, req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
  });
});

// ================= GET USER NESTAS =================
exports.getUserNestas = asyncHandler(async (req, res) => {
  const result = await getUserNestas(req.params.userId, req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
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

  // Process new uploaded images if any (replace existing images)
  if (req.files && req.files.length > 0) {
    const newImages = await processMultipleImages(req.files, "nestas");
    nesta.images = newImages;
  }

  await nesta.save();

  res.status(200).json({
    success: true,
    data: sanitizeNesta(nesta),
  });
});

// ================= SEARCH NESTAS =================
exports.searchNestas = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
      pagination: {
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }

  const result = await searchNestas(q.trim(), req.query);

  res.status(200).json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
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

