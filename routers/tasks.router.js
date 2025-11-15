const {createTask , getTasks , getTask , changeTaskStatus , deleteTask , getChildPoints} = require("../controllers/tasks.controller")
const {PARENT , CHILD} = require("../Utils/userRole")
const express = require("express");
const allowTo = require("../middelwares/allowTo");
const verifyToken = require("../middelwares/verifyToken");
const router = express.Router();

const multer = require("multer");
const storage = multer.diskStorage({
        destination : function(req , file , cb){
                cb(null , "uploads");
        },
        filename : function(req , file , cb){
                const filename = `${Date.now()}.${file.mimetype.split("/")[1]}`;
                cb(null , filename)
        }
})
const upload = multer({ storage: storage })
router.route("/")
        .get(verifyToken , allowTo(CHILD) , getTasks)
router.route("/points")
        .get(verifyToken , getChildPoints)
router.route("/:id")
        .get(verifyToken , allowTo(CHILD) , getTask)
        .patch(verifyToken  , changeTaskStatus)
        .delete(verifyToken , allowTo(PARENT) , deleteTask)
router.route("/createTask")
        .post(verifyToken , allowTo(PARENT),upload.single("photo") , createTask)

module.exports = router;