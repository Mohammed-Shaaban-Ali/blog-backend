const mongoose = require("mongoose");
const joi = require("joi");
var jwt = require("jsonwebtoken");

// Comment Schema
const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// comment model
const Comment = mongoose.model("Comment", CommentSchema);

// validta cteate post
function validateCreateComment(obj) {
  const schema = joi.object({
    postId: joi.string().required(),
    text: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// validta Update post
function validateUpdateComment(obj) {
  const schema = joi.object({
    text: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment,
};
