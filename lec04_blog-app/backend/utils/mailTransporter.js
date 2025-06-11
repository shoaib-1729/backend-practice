const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "shoaibahktar56@gmail.com",
        pass: "izjh awec zptn yhgo",
    },
});


module.exports = transporter