const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../model/Category");

/**--------------------------------
 * @description Create New Category
 * @route /api/categorys
 * @method POST
 * @access private (only admin)
 -------------------------------- */
module.exports.createCategory = asyncHandler(async (req, res) => {
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });

  res.status(201).json(category);
});

/**--------------------------------
 * @description Get all Category
 * @route /api/categorys
 * @method GET
 * @access public
 -------------------------------- */
module.exports.getAllCategory = asyncHandler(async (req, res) => {
  const categorys = await Category.find().sort({ _id: -1 });
  res.status(200).json(categorys);
});

/**--------------------------------
 * @description delete Category
 * @route /api/categorys/:id
 * @method delete
 * @access private (only admin)
 -------------------------------- */
module.exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "category not found" });
  }
  await Category.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({ message: "category sccessfully deleted", categoryid: category.id });
});
