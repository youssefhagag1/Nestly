const express = require("express");
const router = express.Router();

const {
  createNesta,
  getAllNestas,
  getSingleNesta,
  updateNesta,
  deleteNesta,
  upVoteNesta,
  downVoteNesta,
  getMyNestas,
  getUserNestas,
  searchNestas,
} = require("../controllers/nestaController");

const authMiddleware = require("../middlewares/authMiddleware");
const { uploadMultipleImages } = require("../middlewares/uploadImageMiddleware");

const {
  createNestaValidator,
  updateNestaValidator,
  deleteNestaValidator,
  getNestaValidator,
  voteValidator,
  getMyNestasValidator,
  getAllNestasValidator,
  getUserNestasValidator,
  searchNestasValidator,
} = require("../validators/nestaValidator");

// All routes require authentication
router.use(authMiddleware);

// GET /api/v1/nestas/search?q= - search nestas
router.get("/search", searchNestasValidator, searchNestas);

// POST /api/v1/nestas - create a nesta
// GET  /api/v1/nestas - get all nestas
router.route("/")
  .post(uploadMultipleImages("images", 5), createNestaValidator, createNesta)
  .get(getAllNestasValidator, getAllNestas);

// GET /api/v1/nestas/me - get current user's nestas
router.get("/me", getMyNestasValidator, getMyNestas);

// GET /api/v1/users/:userId/nestas - get specific user's nestas
router.get("/users/:userId/nestas", getUserNestasValidator, getUserNestas);

// GET  /api/v1/nestas/:id - get single nesta
// PATCH /api/v1/nestas/:id - update nesta
// DELETE /api/v1/nestas/:id - delete nesta
router.route("/:id")
  .get(getNestaValidator, getSingleNesta)
  .patch(uploadMultipleImages("images", 5), updateNestaValidator, updateNesta)
  .delete(deleteNestaValidator, deleteNesta);

// PATCH /api/v1/nestas/:id/upvote - upvote nesta
router.patch("/:id/upvote", voteValidator, upVoteNesta);

// PATCH /api/v1/nestas/:id/downvote - downvote nesta
router.patch("/:id/downvote", voteValidator, downVoteNesta);

// Nested comment routes — /api/v1/nestas/:nestaId/comments
const commentRoutes = require("./commentRoutes");
router.use("/:nestaId/comments", commentRoutes);

module.exports = router;
