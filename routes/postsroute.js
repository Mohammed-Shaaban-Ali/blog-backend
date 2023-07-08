const {
  createNewPostCtrl,
  GetAllPostCtrl,
  GetSinglePostCtrl,
  GetCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updateImagePostCtrl,
  toggelLikeCtrl,
} = require("../controllers/postController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectid = require("../middlewares/validataObjectid");
const { virfyToken } = require("../middlewares/virfiyToken");
const router = require("express").Router();

//  /api/posts
router
  .route("/")
  .post(virfyToken, photoUpload.single("image"), createNewPostCtrl)
  .get(GetAllPostCtrl);

//  /api/posts/count
router.route("/count").get(GetCountCtrl);

//  /api/posts/:id
router
  .route("/:id")
  .get(validateObjectid, GetSinglePostCtrl)
  .delete(validateObjectid, virfyToken, deletePostCtrl)
  .put(validateObjectid, virfyToken, updatePostCtrl);

//  /api/posts/upload-image/:id
router
  .route("/upload-image/:id")
  .put(
    validateObjectid,
    virfyToken,
    photoUpload.single("image"),
    updateImagePostCtrl
  );
//  /api/posts/like/:id
router.route("/like/:id").put(validateObjectid, virfyToken, toggelLikeCtrl);

module.exports = router;
