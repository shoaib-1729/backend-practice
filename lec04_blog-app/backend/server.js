const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect.js");
const userRoute = require("./routes/userRoute.js");
const blogRoute = require("./routes/blogRoute.js");
const { cloudinaryConfig } = require("./config/cloudinaryConfig.js")

const dotenv = require("dotenv")

dotenv.config()


// create server
const app = express();

// cors
app.use(cors())

// middleware
app.use(express.json());

// routes
app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute)


// listen to server
app.listen(process.env.PORT, () => {
    // cloudinary config
    cloudinaryConfig();
    console.log("Server is listening on port 3000");
    // connect db
    dbConnect();
});