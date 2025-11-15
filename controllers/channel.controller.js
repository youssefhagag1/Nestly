const User = require("../models/users.model")
const Channel = require("../models/channels.model");
const {SUCCESS , FAIL} = require("../Utils/statusText");
const asyncWrapper = require("../middelwares/asyncWrapper");
const requestToChannel = asyncWrapper(async(req , res) => {
    const {channel} = req.body;
    const id = req.user.id;
    const currentChannel = await Channel.findById(channel);
    if(!currentChannel){
        return res.status(404).json({status : FAIL , data : "invalid channel" })
    }
    const updatedUser = await User.findByIdAndUpdate(id , {$set : {channel}} , {new : true});
    const updatedChannel = await Channel.findByIdAndUpdate(channel , { $set: { childsId: [...currentChannel.childsId || [] , id] } } , {new : true})
    res.status(200).json({status : SUCCESS , data : {
        updatedUser , updatedChannel
    } })
});
const getChannels = async (req , res) => {
    const channels = await Channel.find({} , {"__v" : false});
    res.status(200).json({status : SUCCESS , data : {channels} });
}

const getChannel = async (req, res) => {
  const id = req.params.id;
  const channel = await Channel.findById(id)
    .populate("tasks.assignedTo", "-password -__v") 
    .select("-__v"); 

  if (!channel) {
    return res.status(404).json({ status: FAIL, data: "Channel not found" });
  }

  res.status(200).json({
    status: SUCCESS,
    data: { channel },
  });
};

  const expulsionChild = async (req , res) => {
    const id = req.body.id;
    await User.findByIdAndUpdate(id ,{$set : {channel : null}} , {new : true});
    await Channel.findOneAndUpdate({"tasks.assignedTo" : id} , {$pull : {tasks : {assignedTo : id}}} , {new : true});
    const deleteChildFromChannel = await Channel.findOneAndUpdate({childsId : id} , {$pull : {childsId : id }});
    res.status(200).json({status : SUCCESS , data : {channel : deleteChildFromChannel}})
  }

module.exports = {
    getChannels ,
    getChannel,
    requestToChannel ,
    expulsionChild
}