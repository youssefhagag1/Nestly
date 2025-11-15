const {getTips , createTip , deleteTip , updateTip} = require("../controllers/tips.controller");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");
const express = require("express");
const { PARENT } = require("../Utils/userRole");
const router = express.Router();

router.route("/:id")
        .get(verifyToken , allowTo(PARENT) , getTips)
        .delete(verifyToken , allowTo(PARENT) , deleteTip)
router.route("/createTip")
        .post(verifyToken , allowTo(PARENT) , createTip)
router.route("/updateTip")
        .patch(verifyToken , allowTo(PARENT) , updateTip)


module.exports = router;