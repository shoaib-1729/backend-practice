const mongoose = require("mongoose");
// db connection
async function dbConnect() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("Database connected successfully...")
    } catch (error) {
        console.log("Error connecting to DB", error);
    }
}


module.exports = dbConnect;