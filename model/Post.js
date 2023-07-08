const mongoose = require("mongoose");
const joi = require("joi");
var jwt = require("jsonwebtoken");

// Post schema
const PostSchema = new mongoose.Schema(
  {
    titel: {
      type: String,
      require: true,
      trim: true,
      minlenght: 2,
      maxlenght: 200,
    },
    descrption: {
      type: String,
      require: true,
      trim: true,
      minlenght: 10,
      maxlenght: 200,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    category: {
      type: String,
      require: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    linkes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PostSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "postId",
  localField: "_id",
});

// Post model
const Post = mongoose.model("Post", PostSchema);

// validta cteate post
function validateCreatePost(obj) {
  const schema = joi.object({
    titel: joi.string().trim().min(2).max(200).required(),
    descrption: joi.string().trim().min(10).required(),
    category: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// validta Update post
function validateUpdatePost(obj) {
  const schema = joi.object({
    titel: joi.string().trim().min(2).max(200),
    descrption: joi.string().trim().min(10),
    category: joi.string().trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
