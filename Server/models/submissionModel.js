const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "taskId is required"],
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "submittedBy is required"],
    },

    images: [
      {
        type: String,
        required: [true, "image is required"],
      },
    ],

    note: {
      type: String,
      maxlength: [300, "note must be less than 300 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "needs_fix"],
        message: "invalid submission status",
      },
      default: "pending",
    },

    review: {
      comment: {
        type: String,
        maxlength: [500, "comment must be less than 500 characters"],
        default: "",
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      reviewedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;