const mongoose = require("mongoose");
const joi = require("joi");
var jwt = require("jsonwebtoken");

// Category Schema
const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// comment model
const Category = mongoose.model("Category", CategorySchema);

// validta cteate Category
function validateCreateCategory(obj) {
  const schema = joi.object({
    title: joi.string().trim().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Category,
  validateCreateCategory,
};
