const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateEmail, validateNewPassword } = require("../model/User");
const VerificationToken = require("../model/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**--------------------------------
 * @description send Reset Password
 * @route /api/password/reset-password-link
 * @method POST
 * @access public
------------------------------------*/
module.exports.RestPasswordLike = asyncHandler(async (req, res) => {
  // validate
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // get the user from DB
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "User not exist" });
  }

  // create a varification
  let verificationToken = await VerificationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();
  }

  // create like
  const link = `https://mohammed-blog.netlify.app/reset-password/${user._id}/${verificationToken.token}`;

  // create html template
  const htmlTemplate = `
    <div>
      <p>Click on the link below to create new password</p>
      <a href="${link}">new password</a>
    </div>`;

  // setding email
  await sendEmail(user.email, "Reset password", htmlTemplate);

  // response to client

  res.status(200).json({
    message: "password reset link send to your email, please check the email",
  });
});

/**--------------------------------
 * @description get Reset Password
 * @route /api/password/reset-password/:userId/:token
 * @method get
 * @access public
------------------------------------*/
module.exports.getPasswordLike = asyncHandler(async (req, res) => {
  // get the user from DB
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  let verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  // response to client

  res.status(200).json({
    message: "Valid URL ",
  });
});

/**--------------------------------
 * @description  Reset Password
 * @route /api/password/reset-password/:userId/:token
 * @method post
 * @access public
------------------------------------*/
module.exports.resetPasswordLike = asyncHandler(async (req, res) => {
  // validate
  const { error } = validateNewPassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // get the user from DB
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  let verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }
  if (!user.isAccountVerified) {
    user.isAccountVerified = true;
  }
  const salt = await bcrypt.genSalt(10);
  const hashpassword = await bcrypt.hash(req.body.password, salt);

  user.password = hashpassword;
  await user.save();
  await VerificationToken.findByIdAndDelete(verificationToken.userId);

  res
    .status(200)
    .json({ message: "password reset successfully, please login" });
});
