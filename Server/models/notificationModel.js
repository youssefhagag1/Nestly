const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: [
          "task_assigned",
          "submission_reviewed",
          "submission_needs_fix",
          "submission_approved",
          "submission_rejected",
          "comment_added",
          "nesta_vote",
          "room_invite",
        ],
        message: "Invalid notification type",
      },
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Related ID is required"],
    },
    relatedModel: {
      type: String,
      enum: {
        values: ["Task", "Submission", "Comment", "Nesta", "Room"],
        message: "Invalid related model",
      },
      required: [true, "Related model is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by recipient + read status + recency
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;