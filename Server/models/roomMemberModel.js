const mongoose = require("mongoose");
const roomMemberSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "roomId is required"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "status must be pending, approved, or rejected",
      },
      default: "pending",
    },

    roleInRoom: {
      type: String,
      enum: {
        values: ["father", "son"],
        message: "roleInRoom must be father or son",
      },
      required: [true, "roleInRoom is required"],
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

roomMemberSchema.index({ roomId: 1, userId: 1 }, { unique: true });

const RoomMember = mongoose.model("RoomMember", roomMemberSchema);
module.exports = RoomMember;