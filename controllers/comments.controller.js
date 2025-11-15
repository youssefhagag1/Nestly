const Comment = require("../models/comments.model");
const Post = require("../models/posts.model");
const asyncWrapper = require("../middelwares/asyncWrapper");
const {SUCCESS , FAIL} = require("../Utils/statusText");

const addRecommendtion = asyncWrapper(async (req , res) => {
    const id = req.user.id;
    const commentId = req.params.id;
    const {status} = req.body;
    const recommenditionIsExist = await Comment.findOne({ _id: commentId,"recommended.reactant" : id });
    let comment;
    if(recommenditionIsExist){
        comment = await Comment.findOneAndUpdate({ _id : commentId , "recommended.reactant" : id } , {$set : {"recommended.$.status" : status} } , {new : true});
    }else{
        comment = await Comment.findByIdAndUpdate(commentId , { $push : {recommended : {reactant : id , status}} } , {new : true});
    }
    res.status(200).json({status : SUCCESS , data : {comment}})
})

const addComment = asyncWrapper(async (req , res) => {
    const {id , comment} = req.body;
    const publisher = req.user.id;

    const userComment = new Comment({
        publisher,
        comment
    })
    const post = await Post.findByIdAndUpdate(id , {$push : {comments : {_id : userComment._id}}} , {new : true});
    await userComment.save();
    res.status(200).json({status : SUCCESS , data : {post}})
})

const updateComment = asyncWrapper(async (req , res) => {
    const commentId = req.params.id;
    const userId = req.user.id;
    const {comment} = req.body;
    const userComment = await Comment.findOneAndUpdate({_id : commentId , publisher : userId} , {$set : {comment}} , {new : true});
    if(!userComment){
        return res.status(403).json({status : FAIL , data : {token : "unauthorized action"}} );
    }
    res.status(200).json({status : SUCCESS , data : {comment : userComment}});
})

const deleteComment = asyncWrapper(async (req , res) => {
    const commentId = req.params.id;
    const userId = req.user.id;
    const deleted = await Comment.findOneAndDelete({_id : commentId , publisher : userId});
    if(!deleted){
        return res.status(403).json({status : FAIL , data : {token : "unauthorized action"}} );
    }
    await Post.findOneAndUpdate({comments : commentId} , {$pull : {comments : commentId}});
    res.status(200).json({status : SUCCESS , data : null });
})

module.exports = {addComment , updateComment , deleteComment , addRecommendtion};