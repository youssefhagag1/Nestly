const {getPosts , deletePost , createPost , getUserPosts , updatePost} = require("../controllers/posts.controller");
const {likeManuplation} = require("../controllers/likes.controller")
const express = require("express");
const router = express.Router();
const verifyToken = require("../middelwares/verifyToken");
const multer = require("multer");
const storage = multer.diskStorage({
        destination : function(req , file , cb){
                cb(null , "uploads");
        },
        filename : function(req , file , cb){
                const filename = `${Date.now()}.${file.mimetype.split("/")[1]}`;
                cb(null , filename);
        }
});
const fileFilter = (req , file , cb) => {
        if(file.mimetype.startsWith("image/")){
                cb(null , true)
        }else{
                cb(new Error("only images are allowed."))
        }
}
const upload = multer({
    storage,
    fileFilter,
});

router.route("/")
        .get(getPosts)
        .post(verifyToken , upload.array("photos"), createPost)
router.route("/:id")
        .get(verifyToken,getUserPosts)
        .delete(verifyToken , deletePost)
        .patch(verifyToken , updatePost)
router.route("/:id/like")
        .post(verifyToken ,likeManuplation )

module.exports = router;