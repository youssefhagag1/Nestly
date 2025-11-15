const bcrypt = require("bcryptjs");
const {SUCCESS , FAIL , ERROR} = require("../Utils/statusText")
const User = require("../models/users.model");
const Channel = require("../models/channels.model")
const generateToken = require("../Utils/generateToken");
const asyncWrapper = require("../middelwares/asyncWrapper");
const userRole = require("../Utils/userRole");

const getUsers = async (req , res) => {
const limit = req.query.limit || 2;
const page = req.query.page || 1;
const skip = (page - 1) * limit;
// const users = await User.find({} , {"__v" : false}).limit(limit).skip(skip);
const users = await User.find({} , {"__v" : false , "password" : false});
res.status(200).json({status : SUCCESS , data : {users}});
};
const getUser = async (req , res) => {
    const id = req.params.id;
    const user = await User.findById(id , {"__v" : false , "password" : false});
    if(!user){
        return res.status(400).json({status : FAIL , data : "Invalid ID"}) 
    }
     res.status(200).json({status : SUCCESS , data : {user}});
}
const profile = asyncWrapper(async (req , res) => {

const user = await User.findById(req.user.id , {"password" : false , "__v" : false });
res.status(200).json({status : SUCCESS , data : {user}})
}
)

const register = asyncWrapper( async (req , res) => {

const {fname , lname , email , password , phone , role} = req.body;

const oldUser = await User.findOne({email});
if(oldUser){
    return res.status(400).json({status : FAIL , data : "Email Already Used"});
}
const hashedPassword = await bcrypt.hash(password , 8);

const user = new User({
    fname ,
    lname ,
    email,
    phone,
    role,
    password : hashedPassword
});

if(user.role === userRole.PARENT){
    const channel = new Channel({
    parentId : user._id,
    })
    await channel.save();
    user.channel = channel._id;
}
await user.save();

const token = await generateToken({id : user._id , email : user.email , role : user.role});
res.status(201).json({status : SUCCESS , data : {token}});
}
)


const login = asyncWrapper(async (req , res) => {
    const {email , password} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({status : FAIL , data : "User Not Exist!"});
    }
    const matchedPassword = await bcrypt.compare(password , user.password);
    if(!matchedPassword){
        return res.status(400).json({status : FAIL , data : "Invalid Email or Password"});
    }
    const token = await generateToken({id : user._id , email : user.email , role : user.role});
    res.status(201).json({status : SUCCESS , data : {token}});
})

module.exports = {getUsers , getUser , profile , register ,login}