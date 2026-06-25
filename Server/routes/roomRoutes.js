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

// Room image — father only
router.patch("/:roomId/image", uploadRoomImageValidator, uploadSingleImage("image"), uploadRoomImage);
router.delete("/:roomId/image", deleteRoomImageValidator, deleteRoomImage);

module.exports = router;
