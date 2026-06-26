const express = require("express");
const router = express.Router();

const {
  createRoom,
  joinRoom,
  updateMemberStatus,
  getMyRooms,
  getMembersOfRoom,
  uploadRoomImage,
  deleteRoomImage,
  getRoomById,
  updateRoom,
  deleteRoom,
  removeMember,
  leaveRoom,
} = require("../controllers/roomController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const taskRoutes = require("./taskRoutes");

const {
  createRoomValidator,
  joinRoomValidator,
  updateMemberStatusValidator,
  getMembersOfRoomValidator,
  uploadRoomImageValidator,
  deleteRoomImageValidator,
  getRoomByIdValidator,
  updateRoomValidator,
  deleteRoomValidator,
  removeMemberValidator,
  leaveRoomValidator,
} = require("../validators/roomValidator");

// Nested task routes — /api/v1/rooms/:roomId/tasks
router.use("/:roomId/tasks", taskRoutes);

router.use(authMiddleware); // Apply authMiddleware to all routes in this router

// Rooms
router.post("/",  createRoomValidator, createRoom);
router.post("/join",  joinRoomValidator, joinRoom);
router.get("/my-rooms",  getMyRooms);

// Members
router.patch("/members/status",  updateMemberStatusValidator, updateMemberStatus);
router.get("/:roomId/members",  getMembersOfRoomValidator, getMembersOfRoom);

// Room CRUD
router.get("/:roomId", getRoomByIdValidator, getRoomById);
router.patch("/:roomId", updateRoomValidator, updateRoom);
router.delete("/:roomId", deleteRoomValidator, deleteRoom);

// Room image — father only
router.patch("/:roomId/image", uploadRoomImageValidator, uploadSingleImage("image"), uploadRoomImage);
router.delete("/:roomId/image", deleteRoomImageValidator, deleteRoomImage);

// Room Membership
router.delete("/:roomId/members/:userId", removeMemberValidator, removeMember);
router.post("/:roomId/leave", leaveRoomValidator, leaveRoom);

module.exports = router;
