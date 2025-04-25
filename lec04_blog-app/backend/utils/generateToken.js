const jwt = require("jsonwebtoken");

function generateToken(payload) {
    const token = jwt.sign(payload, "jsonkakhatarnakwalakey")
    return token;
}

function validToken(token) {
    try {
        const data = jwt.verify(token, "jsonkakhatarnakwalakey");
        return data;

    } catch (err) {
        // user not verified -> return null
        return null;
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