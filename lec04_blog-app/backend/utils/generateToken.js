const jwt = require("jsonwebtoken");
const logger = require("./logger");
const { JWT_SECRET } = require("../config/dotenv.config");

function generateToken(payload) {
    const token = jwt.sign(payload, JWT_SECRET);
    return token;
}

function validToken(token) {
    try {
        const data = jwt.verify(token, "jsonkakhatarnakwalakey");
        logger.info("Token verified successfully");
        return data;
    } catch (err) {
        logger.info("Token verification error:", err.message);

        if (err.name === "TokenExpiredError") {
            logger.info("Token expired at:", new Date(err.expiredAt));
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
    decodeToken,
};