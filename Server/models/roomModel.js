const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "room name is required"],
      trim: true,
      minlength: [2, "room name must be at least 2 characters"],
      maxlength: [50, "room name must be less than 50 characters"],
    },

    fatherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "fatherId is required"],
    },

    joinCode: {
      type: String,
      required: [true, "join code is required"],
      unique: true,
      minlength: [4, "join code must be at least 4 characters"],
    },

    description: {
      type: String,
      default: "",
      maxlength: [200, "description must be less than 200 characters"],
    },

    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;