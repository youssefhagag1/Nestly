const mongoose = require("mongoose");

const nestaSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: String,
      },
    ],
    upVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for computed vote fields
nestaSchema.virtual("totalUpVotes").get(function () {
  return this.upVotes.length;
});

nestaSchema.virtual("totalDownVotes").get(function () {
  return this.downVotes.length;
});

nestaSchema.virtual("score").get(function () {
  return this.upVotes.length - this.downVotes.length;
});

// Text index for MongoDB full-text search on content
nestaSchema.index({ content: "text" });

// Auto-populate author on find
nestaSchema.pre(/^find/, function (next) {
  this.populate({ path: "author", select: "name email image" });
  next();
});

const Nesta = mongoose.model("Nesta", nestaSchema);
module.exports = Nesta;