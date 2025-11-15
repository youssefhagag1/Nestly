const {SUCCESS , FAIL} = require("../Utils/statusText");
const asyncWrapper = require("../middelwares/asyncWrapper");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");
const getPosts = asyncWrapper( async (req , res) => {
    const posts = await Post.find({} , {__v : 0}).sort({date : -1}).populate("user").populate("comments");
    
    res.status(200).json({status : SUCCESS , data : {posts}});
});
const getUserPosts = asyncWrapper(async (req , res) => {
    const id = req.params.id;
    const posts = await Post.find({user : id}).sort({date : -1}).populate("user").populate("comments");
    res.status(200).json({status : SUCCESS , data : {posts : posts || []}})
})
const createPost = asyncWrapper(async (req , res) => {
    const photos = req.files ? req.files.map(file => file.filename) : [];
    const id = req.user.id;
    const {description } = req.body;
    const post = new Post({
        user : id,
        description,
        photos
    })
    await post.save();
    res.status(200).json({status : SUCCESS , data : {post}})
})
const updatePost = asyncWrapper(async (req , res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const {description} = req.body;
    const post = await Post.findOneAndUpdate({_id : postId , user : userId} , {$set : {description}} , {new : true});
    if(!post){
         return res.status(403).json({status : FAIL , data : {message : "unauthorized action"}})
    }
    res.status(200).json({status : SUCCESS , data : {post}})
})
const deletePost = asyncWrapper(async (req , res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const deleted = await Post.findOneAndDelete({_id : postId , user : userId});
    if(!deleted){
        return res.status(403).json({status : FAIL , data : {token : "unauthorized action"}})
    }
    res.status(200).json({status : SUCCESS , data : null})
   
})


module.exports = {getPosts  , deletePost , createPost , getUserPosts , updatePost}