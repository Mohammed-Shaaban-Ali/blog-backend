const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SCRET,
});

// cloudinary upload image
const cloudinaryUploadImage = async (fileToUpload) => {
  try {
    const date = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return date;
  } catch (error) {
    return error;
  }
};

// cloudinary remove image
const cloudinaryRemoveImage = async (imagePublicId) => {
  try {
    const result = await cloudinary.uploader.destroy(imagePublicId);
    return result;
  } catch (error) {
    return error;
  }
};

// cloudinary remove all image
const cloudinaryRemoveAllImage = async (pubpliIds) => {
  try {
    const result = await cloudinary.v2.api.delete_all_resources(pubpliIds);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveAllImage,
};
