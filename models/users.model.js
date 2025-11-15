const mongoose = require("mongoose");
const validator = require("validator");
const userRole = require("../Utils/userRole")
const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    trim: true,
    minLength: [2, "First name must have at least 2 characters"],
    maxLength: [12, "First name cannot exceed 12 characters"],
    required: true
  },
  lname: {
    type: String,
    trim: true,
    minLength: [2, "Last name must have at least 2 characters"],
    maxLength: [12, "Last name cannot exceed 12 characters"],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Invalid email!"]
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: v => /^01[0-9]{9}$/.test(v),
      message: props => `${props.value} is not a valid Egyptian number.`
    }
  },
  password: {
    type: String,
    required: true
  },
  role : {
    type : String ,
    enum : [userRole.PARENT , userRole.CHILD],
    default :userRole.CHILD
  },
  channel : {
    type : String,
    default : null
  }
});

module.exports = mongoose.model("User", userSchema);
