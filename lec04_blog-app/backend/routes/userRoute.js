const express = require("express");
const upload = require("../utils/multer.js");
const router = express.Router();
const verifyUser = require("../middlewares/auth.js");
const { getUser, getUserById, createUser, checkUsernameAvailability, updateUser, deleteUser, loginUser, verifyEmail, googleAuth, followCreator, userSettings, resetUserPassword, forgetUserPassword } = require("../controllers/userController.js")

// get users
router.get("/users", getUser);

// get particular user (with unique username - custom create kiya hai random har user ke liye)
router.get("/users/:username", getUserById);

// create users
router.post("/signup", createUser);

// login user
router.post("/signin", loginUser);


// reset password
router.put("/auth/reset-password/:id", verifyUser, resetUserPassword);

// forget password
router.put("/auth/forget-password", forgetUserPassword);

// update users
router.patch("/users/:id", verifyUser, upload.single("profilePic"), updateUser);

// delete user
router.delete("/users/", verifyUser, deleteUser);

// routes/userRoutes.js me add karo
router.get("/users/check-username/:username", checkUsernameAvailability);

// verify user
router.get("/verify-email/:verificationToken", verifyEmail)

// google auth route
router.post("/google-auth", googleAuth)

// follow blog creator
router.patch("/follow/:creatorId", verifyUser, followCreator)

// user settings
router.post("/users/:username/settings", verifyUser, userSettings)



// export router
module.exports = router;