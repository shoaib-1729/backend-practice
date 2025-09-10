const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect.js");
const userRoute = require("./routes/userRoute.js");
const blogRoute = require("./routes/blogRoute.js");
const { cloudinaryConfig } = require("./config/cloudinaryConfig.js");
const { PORT, FRONTEND_URL } = require("./config/dotenv.config.js");
const logger = require("./utils/logger.js");

// create server
const app = express();

// cors
app.use(cors());

// middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Chal Raha Hai.");
});

// routes
app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

// listen to server
app.listen(PORT, () => {
  // cloudinary config
  cloudinaryConfig();
  logger.info("Server is running on port 3000");
  // connect db
  dbConnect();
});
