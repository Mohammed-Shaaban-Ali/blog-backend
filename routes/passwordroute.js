const router = require("express").Router();
const {
  RestPasswordLike,
  resetPasswordLike,
  getPasswordLike,
} = require("../controllers/passowrdController");

//  /api/password/reset-password-link
router.route("/reset-password-link").post(RestPasswordLike);

//  /api/password/reset-password/:userId/:token
router
  .route("/reset-password/:userId/:token")
  .get(getPasswordLike)
  .post(resetPasswordLike);

module.exports = router;
