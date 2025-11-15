const mongoose = require("mongoose");
const { Schema } = mongoose;

const postsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  photos: {
    type : Array,
    default : []
  },
  comments: [
    { type: Schema.Types.ObjectId , ref: "Comment" } ,
    
  ],
  likes: [
  { type: Schema.Types.ObjectId, ref: "User" }
]
});

module.exports = mongoose.model("Post", postsSchema);
