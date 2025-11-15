const {requestToChannel , getChannels , getChannel , expulsionChild } = require("../controllers/channel.controller");
const { CHILD, PARENT} = require("../Utils/userRole")
const express = require("express");
const verifyToken = require("../middelwares/verifyToken");
const allowTo = require("../middelwares/allowTo")
const router = express.Router();
router.route("/")
        .get(verifyToken , getChannels)
router.route("/:id")
        .get(verifyToken , getChannel)
router.route("/request")
        .post(verifyToken, allowTo(CHILD) , requestToChannel)
router.route("/deleteChild")
        .delete(verifyToken , allowTo(PARENT) , expulsionChild)

module.exports = router;