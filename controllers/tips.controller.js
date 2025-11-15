const Channel = require("../models/channels.model");
const {SUCCESS , FAIL , ERROR} = require("../Utils/statusText");
const asyncWrapper = require("../middelwares/asyncWrapper");

const getTips = asyncWrapper(async (req ,res) => {
    const id = req.params.id;
    const tips = await Channel.findById(id , {tips : true });
    if(!tips){
        return res.status(400).json({status : FAIL , data : {id : "invalid id"}})
    }
    res.status(200).json({status : SUCCESS , data : {tips}});
});

const createTip = asyncWrapper(async (req , res)=> {
    const {id , description} = req.body;
    const channel = await Channel.findByIdAndUpdate(id , {$push : {tips : {description}}} , {new : true});
    if(!channel){
        return res.status(400).json({status : FAIL , data : {id : "invalid id"}})
    }
    res.status(200).json({status : SUCCESS , data : {tips : channel.tips}});
});

const deleteTip = asyncWrapper(async (req , res) => {
    const id = req.params.id;
    const channel = await Channel.findOneAndUpdate({"tips._id" : id} , {$pull : {tips : {_id : id}}} , {new : true});
    if(!channel){
        return res.status(400).json({status : FAIL , data : {id : "invalid id"}})
    }
    res.status(200).json({status :SUCCESS , data : {tips : channel.tips}});
});
const updateTip = asyncWrapper(async (req , res) => {
    const {id , description} = req.body;
    const channel = await Channel.findOneAndUpdate({"tips._id" : id} , {$set : {"tips.$.description" : description}} , {new : true});
    if(!channel){
        return res.status(400).json({status : FAIL , data : {id : "invalid id"}})
    }
    res.status(200).json({status :SUCCESS , data : {tips : channel.tips}});
});

module.exports = {getTips , createTip , deleteTip , updateTip};