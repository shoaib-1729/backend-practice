const mongoose = require("mongoose");
const { DB_URI, DB_NAME } = require("./dotenv.config");
const logger = require("../utils/logger");

async function dbConnect() {
    try {
        await mongoose.connect(`${DB_URI}/${DB_NAME}`);
        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("MongoDB connection failed: " + error.message);
        process.exit(1);
    }
}

module.exports = dbConnect;