const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");


exports.createRoom = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const joinCode = crypto.randomBytes(3).toString("hex");

  const room = await Room.create({
    name,
    description,
    fatherId: req.user._id,
    joinCode,
  });

  await RoomMember.create({
    roomId: room._id,
    userId: req.user._id,
    roleInRoom: "father",
    status: "approved",
  });

  res.status(201).json({
    success: true,
    room,
  });
});

exports.joinRoom = asyncHandler(async (req, res, next) => {
  const room = req.roomDoc;

  const member = await RoomMember.create({
    roomId: room._id,
    userId: req.user._id,
    roleInRoom: "son",
    status: "pending",
  });

  res.status(200).json({
    success: true,
    message: "Request sent to father",
    member,
  });
});

exports.updateMemberStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const member = req.memberDoc;

  member.status = status;

  await member.save();

  res.status(200).json({
    success: true,
    member,
  });
});

exports.getMyRooms = asyncHandler(async (req, res) => {
  const rooms = await RoomMember.find({
    userId: req.user._id,
    status: "approved",
  }).populate("roomId");

  res.status(200).json({
    success: true,
    count: rooms.length,
    rooms,
  });
});

// PATCH /api/v1/rooms/:roomId/image — upload/update room image (father only)
exports.uploadRoomImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError("No image provided", 400));
  }

  const room = req.roomDoc;

  // Delete old image if exists
  if (room.image) {
    const oldPath = path.join(__dirname, "..", room.image);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const { processSingleImage } = require("../utils/imageProcessing");
  const imageUrl = await processSingleImage(req.file, "rooms");

  room.image = imageUrl;
  await room.save();

  res.status(200).json({
    success: true,
    room,
  });
});

// DELETE /api/v1/rooms/:roomId/image — delete room image (father only)
exports.deleteRoomImage = asyncHandler(async (req, res, next) => {
  const room = req.roomDoc;

  if (!room.image) {
    return next(new ApiError("Room has no image to delete", 400));
  }

  // Delete the image file
  const imagePath = path.join(__dirname, "..", room.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  room.image = "";
  await room.save();

  res.status(200).json({
    success: true,
    message: "Room image deleted successfully",
    room,
  });
});

exports.getMembersOfRoom = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;
  const { status } = req.query;

  const filter = { roomId };

  if (status) {
    filter.status = status;
  }

  const members = await RoomMember.find(filter)
    .populate("userId", "name email role");

  res.status(200).json({
    success: true,
    count: members.length,
    members,
  });
});