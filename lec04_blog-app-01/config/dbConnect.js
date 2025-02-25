const mongoose = require("mongoose");
// db connection
async function dbConnect() {
    try {
        await mongoose.connect("mongodb://localhost:27017/blogDatabase")
        console.log("Database connected successfully...")
    } catch (error) {
        console.log("Error connecting to DB", error);
    }
}


module.exports = dbConnect;