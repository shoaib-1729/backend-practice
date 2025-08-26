const { generateToken } = require("../utils/generateToken.js");
const transporter = require("../utils/mailTransporter.js");
const randomPasswordGenerator = require("./randomPasswordGenerator.js");
require("dotenv").config();


async function sendVerificationEmail(user) {
    const { _id, email } = user;

    // generate JWT token
    const verificationToken = generateToken({ id: _id, email });

    // send email
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        text: "Please verify your email",
        html: `
      <h1>Please click the link to verify your email</h1>
      <a href="http://localhost:5173/verify-user/${verificationToken}">Verify Email</a>
    `,
    });
}

async function sendForgetPasswordEmail(user) {
    const { email } = user;

    const randPass = randomPasswordGenerator()

    // send email
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Your New Temporary Password",
        text: "Check your email for new password",
        html: `
     <h1>Here is your temporary password: ${randPass}</h1>
            <p>Please change it after login..</p>
            <p>This link will expire in 5 minutes.</p>
      `,
    });

    return randPass;
}

module.exports = { sendVerificationEmail, sendForgetPasswordEmail };