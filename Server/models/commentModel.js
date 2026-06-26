const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    nestaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nesta",
      required: [true, "Nesta ID is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment user is required"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient querying
commentSchema.index({ nestaId: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;