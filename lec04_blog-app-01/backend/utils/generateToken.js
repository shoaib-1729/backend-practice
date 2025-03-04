const jwt = require("jsonwebtoken");

function generateToken(payload) {
    const token = jwt.sign(payload, "jsonkakhatarnakwalakey")
    return token;
}

function validToken(token) {
    try {
        const isValid = jwt.verify(token, "jsonkakhatarnakwalakey");
        return true;

    } catch (err) {
        return false;
    }
}

function decodeToken(token) {
    const decoded = jwt.decode(token)
    return decoded;
}


module.exports = {
    generateToken,
    validToken,
    decodeToken
}