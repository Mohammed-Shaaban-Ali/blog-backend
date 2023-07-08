const {
  createCategory,
  getAllCategory,
  deleteCategory,
} = require("../controllers/categorysController");
const { verifyTokenAndAdmin } = require("../middlewares/virfiyToken");
const validataObjectid = require("../middlewares/validataObjectid");

const router = require("express").Router();

// /api/categorys
router.route("/").post(verifyTokenAndAdmin, createCategory).get(getAllCategory);

// /api/categorys:id
router
  .route("/:id")
  .delete(validataObjectid, verifyTokenAndAdmin, deleteCategory);

module.exports = router;
