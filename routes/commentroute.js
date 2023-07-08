const router = require("express").Router();
const {
  createComment,
  getAllComments,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");
const validataObjectid = require("../middlewares/validataObjectid");
const {
  virfyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/virfiyToken");

//  /api/comments
router
  .route("/")
  .post(virfyToken, createComment)
  .get(verifyTokenAndAdmin, getAllComments);

//  /api/comments.:id
router
  .route("/:id")
  .delete(validataObjectid, virfyToken, deleteComment)
  .put(validataObjectid, virfyToken, updateComment);

module.exports = router;
