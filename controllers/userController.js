const bcrypt = require("bcryptjs");
const path = require("path");
var fs = require("fs");

const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../model/User");
const {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
  cloudinaryRemoveAllImage,
} = require("../utils/cloudinar");
const { Comment } = require("../model/Comment");
const { Post } = require("../model/Post");

/**--------------------------------
 * @description Get all User profile
 * @route /api/users/profile
 * @method Get
 * @access private (only admin)
------------------------------------*/
module.exports.getAllUserCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});

/**--------------------------------
 * @description Get User profile
 * @route /api/users/profile/:id
 * @method Get
 * @access public (only user )
------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json(user);
});

/**--------------------------------
 * @description update User profile
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  )
    .select("-password")
    .populate("posts");
  res.status(200).json(updateUser);
});

/**--------------------------------
 * @description delete user profile 
 * @route /api/users/profile/:id
 * @method Delete
 * @access private (only admin of user himself)
------------------------------------*/
module.exports.deleteUserProfile = asyncHandler(async (req, res) => {
  // get user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // get all post fronm db
  const posts = await Post.find({ user: user._id });
  // get the public ids from the post
  const pubpliIds = posts.map((post) => post.image.publicId);
  // delete all post image from the cloudinary
  if (pubpliIds.length > 0) {
    await cloudinaryRemoveAllImage(pubpliIds);
  }

  // delete the profile image from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // delete user post and comment
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // delete user himself
  await User.findByIdAndDelete(req.params.id);

  // send the response to client
  res.status(200).json({ message: "User profile has been deleted" });
});

/**--------------------------------
 * @description Profile Photo Upload
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }

  //Get the path to the image
  const imagePath = await path.join(
    __dirname,
    `../images/${req.file.filename}`
  );

  // upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  // get the user from DB
  const user = await User.findById(req.user.id);

  // delete the old profile photo if exists
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // change the profilephoto filde in DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();

  // send response to client
  res.status(200).json({
    message: "Profile Photo Upload Successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  // remove image from the server
  fs.unlinkSync(imagePath);
});

/**--------------------------------
 * @description Get count Users
 * @route /api/users/count
 * @method Get
 * @access private (only admin)
------------------------------------*/
module.exports.getUsercount = asyncHandler(async (req, res) => {
  const count = await User.count();
  res.status(200).json(count);
});
