const Comment = require("../models/commentModel");
const { paginate, buildSort } = require("./paginationService");

/**
 * Get comments for a nesta with pagination and sorting
 * @param {ObjectId} nestaId - Nesta ID
 * @param {Object} query - Express query object
 * @returns {Promise<Object>} Paginated comments
 */
exports.getNestaComments = async (nestaId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  // Build sort object - only allow createdAt for comments
  const sortObj = buildSort(query, ["createdAt"], "-createdAt");

  // Build query
  let commentsQuery = Comment.find({ nestaId })
    .populate("user", "name email image")
    .sort(sortObj);

  // Paginate results
  const result = await paginate(commentsQuery, page, limit);

  // Sanitize data
  const sanitizedData = result.data.map((comment) => {
    const obj = comment.toJSON();
    if (obj.isAnonymous) {
      obj.user = "Anonymous";
    }
    return obj;
  });

  return {
    data: sanitizedData,
    pagination: result.pagination,
  };
};

/**
 * Update comment content
 * @param {ObjectId} commentId - Comment ID
 * @param {ObjectId} userId - User ID (owner)
 * @param {String} content - New content
 * @returns {Promise<Object>} Updated comment
 */
exports.updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Verify ownership
  if (comment.user.toString() !== userId.toString()) {
    throw new Error("Only the comment owner can edit this comment");
  }

  // Update content and set editedAt
  comment.content = content;
  comment.editedAt = new Date();

  await comment.save();

  // Populate user for response
  await comment.populate("user", "name email image");

  // Sanitize response
  const obj = comment.toJSON();
  if (obj.isAnonymous) {
    obj.user = "Anonymous";
  }

  return obj;
};