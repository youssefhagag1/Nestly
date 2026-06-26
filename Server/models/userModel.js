const mongoose = require("mongoose");

const setImage = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
    doc.image = imageUrl;
  }
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: [2, "name must be at least 2 characters"],
      maxlength: [50, "name must be less than 50 characters"],
    },

    age: {
      type: Number,
      required: [true, "age is required"],
      min: [1, "age must be at least 1"],
      max: [100, "age must be less than 100"],
    },

    gender: {
      type: String,
      required: [true, "gender is required"],
      enum: {
        values: ["male", "female"],
        message: "gender must be male or female",
      },
    },

    country: {
      type: String,
      required: [true, "country is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "phone is required"],
      unique: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    isVerified: { type: Boolean, default: false },

    emailVerifyToken: String,
    emailVerifyExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    twoFactorSecret: String,


    twoFactorEnabled: { type: Boolean, default: false },
    role: {
      type: String,
      required: [true, "role is required"],
      enum: {
        values: ["parent", "child"],
        message: "role must be parent or child",
      },
    },

    bio: {
      type: String,
      default: "",
      maxlength: [300, "bio must be less than 300 characters"],
    },

    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.post("init", (doc) => {
  setImage(doc);
});

userSchema.post("save", (doc) => {
  setImage(doc);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
