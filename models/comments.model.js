const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentsSchema = new Schema({
  publisher: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  comment: {
    type: String,
    required: true
  },
  recommended : [
    {
      reactant : {
        type : Schema.Types.ObjectId,
        required : true
      },
      status : {
        type : Number,
        enum : [1 , -1],
      }
    }
  ]
});

module.exports = mongoose.model("Comment", commentsSchema);
