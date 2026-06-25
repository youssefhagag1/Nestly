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
} = require("../controllers/nestaController");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  createNestaValidator,
  updateNestaValidator,
  deleteNestaValidator,
  getNestaValidator,
  voteValidator,
} = require("../validators/nestaValidator");

// All routes require authentication
router.use(authMiddleware);

// POST /api/v1/nestas - create a nesta
// GET  /api/v1/nestas - get all nestas
router.route("/")
  .post(createNestaValidator, createNesta)
  .get(getAllNestas);

// GET  /api/v1/nestas/:id - get single nesta
// PATCH /api/v1/nestas/:id - update nesta
// DELETE /api/v1/nestas/:id - delete nesta
router.route("/:id")
  .get(getNestaValidator, getSingleNesta)
  .patch(updateNestaValidator, updateNesta)
  .delete(deleteNestaValidator, deleteNesta);

// PATCH /api/v1/nestas/:id/upvote - upvote nesta
router.patch("/:id/upvote", voteValidator, upVoteNesta);

// PATCH /api/v1/nestas/:id/downvote - downvote nesta
router.patch("/:id/downvote", voteValidator, downVoteNesta);

// Nested comment routes — /api/v1/nestas/:nestaId/comments
const commentRoutes = require("./commentRoutes");
router.use("/:nestaId/comments", commentRoutes);

module.exports = router;
