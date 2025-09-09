const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    FIREBASE_ADMIN_CONFIG: process.env.FIREBASE_ADMIN_CONFIG,
    PORT: process.env.PORT,
    DB_URI: process.env.DB_URI,
    DB_NAME: process.env.DB_NAME,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    MAIL_SECURE: process.env.MAIL_SECURE,
    SECRET_KEY: process.env.SECRET_KEY,
    FRONTEND_URL: process.env.FRONTEND_URL,
    JWT_SECRET: process.env.JWT_SECRET,
};