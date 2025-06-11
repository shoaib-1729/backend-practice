const express = require("express");
const router = express.Router();
const { getUser, getUserById, createUser, updateUser, deleteUser, loginUser, verifyToken } = require("../controllers/userController.js")

// get users
router.get("/users", getUser);

// get particular users (with id)
router.get("/users/:id", getUserById);

// create users
router.post("/signup", createUser);

// login user
router.post("/signin", loginUser);

// update users
router.put("/users/:id", updateUser);

// delete users
router.delete("/users/:id", deleteUser);

// verify user
router.get("/verify-email/:verificationToken", verifyToken)


// export router
module.exports = router;