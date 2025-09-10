const logger = require("../utils/logger");
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("./dotenv.config");

const cloudinary = require("cloudinary").v2;

async function cloudinaryConfig() {
  console.log("Cloudinary Cloud Name", CLOUDINARY_CLOUD_NAME);
  console.log("Cloudinary Api key", CLOUDINARY_API_KEY);
  console.log("Cloudinary Api Secret", CLOUDINARY_API_SECRET);
  try {
    // Configuration
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    logger.info("Cloudinary configured successfully...");
  } catch (err) {
    logger.error("Error while configuring cloudinary: ", err);
  }
}
// image upload cloudinary
async function cloudinaryImageUpload(imgPath) {
  try {
    const result = await cloudinary.uploader.upload(imgPath, {
      folder: "blog app",
    });
    return result;
  } catch (err) {
    logger.error("Error while uploading image to cloudinary: ", err);
  }
}

// cloudinary destroy image
async function cloudinaryDestroyImage(public_id) {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    logger.error("Error while uploading image to cloudinary: ", err);
  }
}

module.exports = {
  cloudinaryConfig,
  cloudinaryImageUpload,
  cloudinaryDestroyImage,
};
