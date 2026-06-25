const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "roomId is required"],
    },

    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: [2, "title must be at least 2 characters"],
      maxlength: [100, "title must be less than 100 characters"],
    },

    description: {
      type: String,
      default: "",
      maxlength: [500, "description must be less than 500 characters"],
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "assignedTo is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "submitted", "completed", "rejected"],
        message: "invalid task status",
      },
      default: "pending",
    },

    dueDate: {
      type: Date,
    },

    attachments: [
      {
        type: String, // father's reference image URLs
      },
    ],
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;