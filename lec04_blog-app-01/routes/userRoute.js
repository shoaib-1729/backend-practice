const express = require("express");
const router = express.Router();
const { getUser, getUserById, createUser, updateUser, deleteUser } = require("../controllers/userController.js")

// get users
router.get("/users", getUser);

// get particular users (with id)
router.get("/users/:id", getUserById);

// create users
router.post("/users", createUser);

// update users
router.put("/users/:id", updateUser);

// delete users
router.delete("/users/:id", deleteUser);

// export router
module.exports = router;