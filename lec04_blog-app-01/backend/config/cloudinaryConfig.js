const cloudinary = require("cloudinary").v2;

async function cloudinaryConfig() {
    try {
        // Configuration
        cloudinary.config({
            cloud_name: 'dctaipnry',
            api_key: '258243633654434',
            api_secret: 'cJWiqT4eB7nF7I4HUgZP_uPZxvI'
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