const express = require("express");
const router = express.Router();
const verifyToken = require("../middelwares/verifyToken");
const {addComment , updateComment , deleteComment , addRecommendtion} = require("../controllers/comments.controller")
router.route("/")
        .post(verifyToken , addComment)
router.route("/:id")
        .patch(verifyToken , updateComment)
        .delete(verifyToken , deleteComment)
router.route("/:id/recommend")
        .post(verifyToken , addRecommendtion)
module.exports = router;