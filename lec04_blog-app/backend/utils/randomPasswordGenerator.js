const crypto = require("crypto");


function randomPasswordGenerator(length = 10) {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


    const randomCryptoPass =
        Array.from(crypto.randomBytes(length))
        .map((b) => chars[b % chars.length])
        .join("")

    return randomCryptoPass


}

module.exports = randomPasswordGenerator;