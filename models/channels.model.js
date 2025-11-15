const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const taskStatus  = require("../Utils/taskStatus")
const channelschema = new mongoose.Schema({
    parentId : {
        type : ObjectId,
        required : true,
        ref: "User"
    },
    childsId : {
        type : Array,
        default : [],
        ref: "User"
    },
    tips : {
        type : [
           {
             description : {
                type : String,
                required : true,
            },
           }
        ],
        default : []
    },
    tasks : {
        type : [
            {
                title : {
                    type : String,
                    required : true
                },
                assignedTo : {
                    type : ObjectId,
                    required : true,
                    ref: "User"
                },
                description : {
                    type : String,
                    required : true
                },
                status : {
                    type : String,
                    enum : taskStatus,
                    default : "PENDING" ,
                    required : true
                },
                photo : {
                    type : String,
                    default : null
                },
                points : {
                    type : Number,
                    required:true

                }
            }
        ],
        default : []
    }
})

module.exports = mongoose.model("Channel" , channelschema);