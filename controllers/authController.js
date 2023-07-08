const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginrUser,
} = require("../model/User");

/**--------------------------------
 * @description Register New User
 * @route /api/auth/register
 * @method POST
 * @access public
------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  // validate
  const { error } = validateRegisterUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // is user already registered
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json({ message: "User already exist" });

  // hash password
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // new user amd save it in database
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });
  await user.save();

  // send request to client
  return res
    .status(201)
    .json({ message: "You register successfully, please loign" });
});

/**--------------------------------
 * @description Login
 * @route /api/auth/login
 * @method POST
 * @access public
------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // validate
  const { error } = validateLoginrUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // is user already registered
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: "invalid email or passowrd" });

  // check password
  const isPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isPassword)
    return res.status(400).json({ message: "invalid email or passowrd" });

  // generate token (jwt)
  const token = user.genrateAuthToken();

  // send respons to client
  res.status(200).json({
    _id: user.id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username,
  });
});
