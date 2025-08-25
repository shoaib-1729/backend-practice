// const jwt = require("jsonwebtoken");

// function generateToken(payload) {
//     const token = jwt.sign(payload, "jsonkakhatarnakwalakey")
//     return token;
// }

// function validToken(token) {
//     try {
//         const data = jwt.verify(token, "jsonkakhatarnakwalakey");
//         return data;

//     } catch (err) {
//         // user not verified -> return null
//         return null;
//     }
// }

// function decodeToken(token) {
// const decoded = jwt.decode(token)
//     return decoded;
// }


// module.exports = {
//     generateToken,
//     validToken,
//     decodeToken
// }


const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret"; // ✅ secret env me rakho

// Generate token
function generateToken(payload, expiresIn = "15m") {
    // default 15 minutes
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Validate & verify token
function validToken(token) {
    try {
        const data = jwt.verify(token, SECRET_KEY);
        return data; // ✅ verified payload
    } catch (err) {
        return null; // invalid ya expired token
    }
}

// Just decode without verifying (⚠️ unsafe, use only for debugging)
function decodeToken(token) {
    return jwt.decode(token);
}

module.exports = {
    generateToken,
    validToken,
    decodeToken
};