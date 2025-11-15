const Channel = require("../models/channels.model");
const User = require("../models/users.model");
const {SUCCESS , FAIL} = require("../Utils/statusText");
const taskStatus = require("../Utils/taskStatus")
const asyncWrapper =require("../middelwares/asyncWrapper");
const mongoose = require("mongoose")
const createTask = asyncWrapper(async (req, res) => {
  const { channel, points, title, description, assignedTo } = req.body;
  const photo = req.file ? req.file.filename : null;

  const oldChannel = await Channel.findById(channel);
  if (!oldChannel) {
    return res.status(400).json({ status: FAIL, data: "channel not exist" });
  }

  const updatedChannel = await Channel.findByIdAndUpdate(
    channel,
    {
      $push: {
        tasks: { points, title,  description, assignedTo, photo },
      },
    },
    { new: true }
  );

  res.status(200).json({ status: SUCCESS, data: { updatedChannel } });
})


const getTasks = asyncWrapper(async (req , res)=>{
    const id = req.user.id;
    const {channel} = await User.findById(id);
    const {tasks : allTasks} = await Channel.findById(channel);
    console.log(allTasks)
    const tasks = allTasks.filter(task => task.assignedTo == id );
    res.status(200).json({status : SUCCESS , data : {tasks}});
});

const getTask = asyncWrapper(async (req, res) => {
  const taskId = req.params.id;

  const channel = await Channel.findOne(
    { "tasks._id": taskId },
    { "tasks.$": true } 
  );

  if (!channel) {
    return res.status(404).json({ status: FAIL, message: "Task not found" });
  }

  res.status(200).json({
    status: SUCCESS,
    data: { task: channel.tasks[0] }
  });
})
const deleteTask = asyncWrapper(async (req , res) => {
  const id = req.params.id;
  await Channel.findOneAndUpdate({"tasks._id" : id} , {$pull : {tasks : {_id :id}}}, {nwe : true});
  res.status(200).json({status : SUCCESS , data : null});
})

const changeTaskStatus = asyncWrapper(async (req , res) => {
  const id = req.params.id;
  const status = req.body.status.toUpperCase();
  if(!taskStatus.includes(status)){
    return res.status(400).json({status : FAIL , data : {status : `status should be uppercase and one of ${taskStatus}`}});
  }
  const updatedTasks = await Channel.findOneAndUpdate({"tasks._id" : id }  , {$set : { "tasks.$.status" : status}} , {new : true});
  if(!updatedTasks){
    return res.status(404).json({ status: FAIL, message: "Task not found" });
  }
  const task = updatedTasks.tasks.filter(task => task.id == id);
  res.status(200).json({status : SUCCESS , data : {task}});
})
const getChildPoints = asyncWrapper(async (req , res) => {
  const id = req.user.id;
  const totalPoints = await Channel.aggregate([
    { $unwind: "$tasks" },
    { $match: { "tasks.assignedTo": new mongoose.Types.ObjectId(id) , "tasks.status" : "COMPLETE" } },
    { $group: { _id: "$tasks.assignedTo", total: { $sum: "$tasks.points" } } }
  ]);
  res.status(200).json({status : SUCCESS , data : {totalPoints : totalPoints[0]?.total || 0}});
})
module.exports = {createTask , getTasks , getTask , changeTaskStatus , deleteTask , getChildPoints}