const express = require("express");
const upload = require("../utils/multer.js");
const router = express.Router();
const verifyUser = require("../middlewares/auth.js");
const { getUser, getUserById, createUser, updateUser, deleteUser, loginUser, verifyEmail, googleAuth, followCreator } = require("../controllers/userController.js")

// get users
router.get("/users", getUser);

// get particular user (with unique username - custom create kiya hai random har user ke liye)
router.get("/users/:username", getUserById);

// create users
router.post("/signup", createUser);

// login user
router.post("/signin", loginUser);

// update users
router.patch("/users/:id", verifyUser, upload.single("profilePic"), updateUser);

// delete users
router.delete("/users/:id", verifyUser, deleteUser);

// verify user
router.get("/verify-email/:verificationToken", verifyEmail)

// google auth route
router.post("/google-auth", googleAuth)

// follow blog creator 
router.patch("/follow/:creatorId", verifyUser, followCreator)



// export router
module.exports = router;