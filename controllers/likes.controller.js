const asyncWrapper = require("../middelwares/asyncWrapper");
const Post = require("../models/posts.model");
const { SUCCESS } = require("../Utils/statusText");

const likeManuplation = asyncWrapper(async (req, res) => {
    const id = req.user.id;
    const postId = req.params.id;

    const isLiked = await Post.findOne({ _id: postId, likes: id });

    if (isLiked) {
        await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { likes: id } }
        );
    } else {
        await Post.findOneAndUpdate(
            { _id: postId },
            { $push: { likes: id } }
        );
    }

    const post = await Post.findById(postId).select("likes");
    const likes = post.likes.length;

    res.status(200).json({ status: SUCCESS, data: { likes } });
});

module.exports = {likeManuplation}