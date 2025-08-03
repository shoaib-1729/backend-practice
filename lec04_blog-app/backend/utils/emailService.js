const { generateToken } = require("../utils/generateToken.js");
const transporter = require("../utils/mailTransporter.js");


async function sendVerificationEmail(user) {
    const { _id, email } = user;

    // generate JWT token
    const verificationToken = generateToken({ id: _id, email });

    console.log(email)

    // send email
    await transporter.sendMail({
        from: "shoaibahktar56@gmail.com",
        to: email,
        subject: "Email Verification",
        text: "Please verify your email",
        html: `
      <h1>Please click the link to verify your email</h1>
      <a href="http://localhost:5173/verify-user/${verificationToken}">Verify Email</a>
    `,
    });
}

module.exports = sendVerificationEmail;