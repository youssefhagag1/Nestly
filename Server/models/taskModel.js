const mongoose = require("mongoose");

const setAttachments = (doc) => {
  if (doc.attachments && doc.attachments.length > 0) {
    const attachments = doc.attachments.map(
      (attachment) => `${process.env.BASE_URL}/tasks/${attachment}`
    );
    doc.attachments = attachments;
  }
};

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

taskSchema.post("init", (doc) => {
  setAttachments(doc);
});

taskSchema.post("save", (doc) => {
  setAttachments(doc);
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
