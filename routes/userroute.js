const router = require("express").Router();
const {
  getAllUserCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsercount,
  profilePhotoUploadCtrl,
  deleteUserProfile,
} = require("../controllers/userController");
const {
  verifyTokenAndAdmin,
  verifyTokenOnlyUser,
  virfyToken,
  verifyTokenAdminOrUser,
} = require("../middlewares/virfiyToken");
const validateObjectid = require("../middlewares/validataObjectid");
const photoUpload = require("../middlewares/photoUpload");

//  /api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUserCtrl);

//  /api/users/profile:id
router
  .route("/profile/:id")
  .get(validateObjectid, getUserProfileCtrl)
  .put(validateObjectid, verifyTokenOnlyUser, updateUserProfileCtrl)
  .delete(validateObjectid, verifyTokenAdminOrUser, deleteUserProfile);
//  /api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(virfyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

//  /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsercount);

module.exports = router;
