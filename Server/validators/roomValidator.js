const { body, param, query } = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatorMiddleware = require("../middlewares/validatorMiddleware");
const ApiError = require("../utils/ApiError");
const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");

exports.createRoomValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Room name is required"),

  body("description")
    .optional()
    .trim(),

  validatorMiddleware,
];

exports.joinRoomValidator = [
  body("joinCode")
    .trim()
    .notEmpty().withMessage("Join code is required"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const room = await Room.findOne({ joinCode: req.body.joinCode });
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }

    const existingMember = await RoomMember.findOne({
      roomId: room._id,
      userId: req.user._id,
    });
    if (existingMember) {
      return next(new ApiError("Already joined or request pending", 400));
    }

    req.roomDoc = room;
    next();
  }),
];

exports.updateMemberStatusValidator = [
  body("memberId")
    .notEmpty().withMessage("Member ID is required")
    .isMongoId().withMessage("Invalid member ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const member = await RoomMember.findById(req.body.memberId);
    if (!member) {
      return next(new ApiError("Member not found", 404));
    }
    if (member.roleInRoom !== "son") {
      return next(new ApiError("Only sons are moderated", 400));
    }

    const room = await Room.findById(member.roomId);
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }
    if (room.fatherId.toString() !== req.user._id.toString()) {
      return next(new ApiError("Only father can approve or reject members", 403));
    }

    req.memberDoc = member;
    next();
  }),
];

exports.getMembersOfRoomValidator = [
  param("roomId")
    .notEmpty().withMessage("Room ID is required")
    .isMongoId().withMessage("Invalid room ID"),

  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"]).withMessage("Invalid status filter"),

  validatorMiddleware,

  asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return next(new ApiError("Room not found", 404));
    }

    const meAsMember = await RoomMember.findOne({
      roomId: req.params.roomId,
      userId: req.user._id,
      status: "approved",
    });

    if (!meAsMember || meAsMember.roleInRoom !== "father") {
      return next(new ApiError("Not allowed", 403));
    }

    next();
  }),
];

const roomExistsAndFatherGuard = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.roomId);
  if (!room) {
    return next(new ApiError("Room not found", 404));
  }
  if (room.fatherId.toString() !== req.user._id.toString()) {
    return next(new ApiError("Only the father can manage the room image", 403));
  }

  req.roomDoc = room;
  next();
});

exports.uploadRoomImageValidator = [
  param("roomId")
    .notEmpty().withMessage("Room ID is required")
    .isMongoId().withMessage("Invalid room ID"),

  validatorMiddleware,

  roomExistsAndFatherGuard,
];

exports.deleteRoomImageValidator = [
  param("roomId")
    .notEmpty().withMessage("Room ID is required")
    .isMongoId().withMessage("Invalid room ID"),

  validatorMiddleware,

  roomExistsAndFatherGuard,
];
