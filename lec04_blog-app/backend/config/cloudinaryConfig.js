const cloudinary = require("cloudinary").v2;

async function cloudinaryConfig() {
    try {
        // Configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        console.log("Cloudinary configured successfully...");
    } catch (err) {
        console.error("Error while configuring cloudinary: ", err)

    }

}
// image upload cloudinary
async function cloudinaryImageUpload(imgPath) {
    try {
        const result = await cloudinary.uploader.upload(imgPath, {
            folder: "blog app"
        });
        return result;
    } catch (err) {
        console.error("Error while uploading image to cloudinary: ", err)
    }

}

// cloudinary destroy image
async function cloudinaryDestroyImage(public_id) {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        console.error("Error while uploading image to cloudinary: ", err)
    }
}

module.exports = { cloudinaryConfig, cloudinaryImageUpload, cloudinaryDestroyImage };