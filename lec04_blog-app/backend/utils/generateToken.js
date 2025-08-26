const jwt = require("jsonwebtoken");

function generateToken(payload) {
    const token = jwt.sign(
        payload,
        "jsonkakhatarnakwalakey",
        // { expiresIn: '10y' }
    );
    console.log("Token generated with 7 days expiry");
    return token;
}

function validToken(token) {
    try {
        const data = jwt.verify(token, "jsonkakhatarnakwalakey");
        console.log("Token verified successfully");
        return data;
    } catch (err) {
        console.log("Token verification error:", err.message);

        if (err.name === 'TokenExpiredError') {
            console.log("Token expired at:", new Date(err.expiredAt));
        }

        return null;
    }
}

function decodeToken(token) {
    const decoded = jwt.decode(token);
    return decoded;
}

module.exports = {
    generateToken,
    validToken,
    decodeToken
};