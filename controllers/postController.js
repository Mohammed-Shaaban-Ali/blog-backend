const path = require("path");
var fs = require("fs");
const asyncHandler = require("express-async-handler");
const {
  validateCreatePost,
  validateUpdatePost,
  Post,
} = require("../model/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinar");
const { Comment } = require("../model/Comment");

/**--------------------------------
 * @description Create new post
 * @route /api/posts
 * @method post
 * @access private (only logged in users)
------------------------------------*/
module.exports.createNewPostCtrl = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  //validation DB
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // upload photo
  const imagePath = await path.join(
    __dirname,
    `../images/${req.file.filename}`
  );
  const result = await cloudinaryUploadImage(imagePath);

  // create new post and save
  const post = await Post.create({
    titel: req.body.titel,
    descrption: req.body.descrption,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  // send response to the client
  res.status(200).json(post);

  // remove image from server
  fs.unlinkSync(imagePath);
});

/**--------------------------------
 * @description Get all post
 * @route /api/posts
 * @method GET
 * @access public
------------------------------------*/
module.exports.GetAllPostCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

/**--------------------------------
 * @description Get single post
 * @route /api/posts/:id
 * @method GET
 * @access public
------------------------------------*/
module.exports.GetSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  res.status(200).json(post);
});

/**--------------------------------
 * @description Delete post
 * @route /api/posts/:id
 * @method Delete
 * @access public
------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);
    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      message: "post has been deleted successfully",
      postId: post._id,
    });
  } else {
    res.status(403).json({ message: "access denied, forbidden" });
  }
});

/**--------------------------------
 * @description update post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only owner)
------------------------------------*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(404).json({ message: error.details[0].message });
  }
  // get the post from the DB
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  // check if this post is beloged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(404)
      .json({ message: "access denied, you are not allowed" });
  }

  //   update the post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        titel: req.body.titel,
        descrption: req.body.descrption,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);
  //   send response
  res.status(200).json({ updatedPost });
});

/**--------------------------------
 * @description update post-image
 * @route /api/posts/upload-image/:id
 * @method PUT
 * @access private (only owner)
------------------------------------*/
module.exports.updateImagePostCtrl = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(404).json({ message: "no image provided" });
  }

  // get the post from the DB
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // check if this post is beloged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(404)
      .json({ message: "access denied, you are not allowed" });
  }

  //   delete the old image
  await cloudinaryRemoveImage(post.image.publicId);

  // upload photo
  const imagePath = await path.join(
    __dirname,
    `../images/${req.file.filename}`
  );
  const result = await cloudinaryUploadImage(imagePath);

  //   update the image
  const updatedImage = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  //   send response
  res.status(200).json({ updatedImage });
  //   remove the image from server
  fs.unlinkSync(imagePath);
});

/**--------------------------------
 * @description toggel lihe
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
------------------------------------*/
module.exports.toggelLikeCtrl = asyncHandler(async (req, res) => {
  const loggedUser = req.user.id;
  const { id: postId } = req.params;

  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  const isPostAlreadyLiked = post.linkes.find(
    (user) => user.toString() === loggedUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          linkes: loggedUser,
        },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          linkes: loggedUser,
        },
      },
      { new: true }
    );
  }

  res.status(200).json({ post });
});

/**--------------------------------
 * @description Get count 
 * @route /api/posts/count
 * @method GET
 * @access public
------------------------------------*/
module.exports.GetCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.count();

  res.status(200).json(count);
});
