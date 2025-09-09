const nodemailer = require("nodemailer");
const {
    MAIL_USER,
    MAIL_PASS,
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
} = require("../config/dotenv.config");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
    },
});

module.exports = transporter;