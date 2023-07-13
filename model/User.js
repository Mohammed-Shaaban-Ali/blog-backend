const mongoose = require("mongoose");
const joi = require("joi");
var jwt = require("jsonwebtoken");

// USer Schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true,
      minlenght: 2,
      maxlenght: 100,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      minlenght: 2,
      maxlenght: 100,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      trim: true,
      minlenght: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate posts that belongs to this user he Get his profile
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

// generate auth token
UserSchema.methods.genrateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET
  );
};

// User model
const User = mongoose.model("User", UserSchema);

// validta register user
function validateRegisterUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100).required(),
    email: joi.string().trim().min(2).max(100).required().email(),
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// validta login user
function validateLoginrUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(2).max(100).required().email(),
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// validta update user
function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100),
    password: joi.string().trim().min(8),
    bio: joi.string(),
  });
  return schema.validate(obj);
}

// validta email
function validateEmail(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(2).max(100).required().email(),
  });
  return schema.validate(obj);
}

// validta new password
function validateNewPassword(obj) {
  const schema = joi.object({
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginrUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassword,
};
