const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect.js");
const userRoute = require("./routes/userRoute.js");
const blogRoute = require("./routes/blogRoute.js");


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
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
    // connect db
    dbConnect();
});