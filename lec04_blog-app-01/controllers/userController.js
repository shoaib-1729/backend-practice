// business logic
const User = require("../models/userModel.js");
async function getUser(req, res) {
    try {
        const users = await User.find({});
        // get the users
        res.json({ "message": "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", "error": error.message });
    }
}

async function getUserById(req, res) {
    try {
        const users = await User.findById(req.params.id);
        // get the users
        res.json({ "message": "Users fetched successfully", users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", "error": error.message });
    }

}

async function createUser(req, res) {
    const { name, email, password } = req.body;

    // error handling
    if (!name) {
        res.send("Enter name")
    }
    if (!email) {
        res.send("Enter email")
    }
    if (!password) {
        res.send("Enter passowrd")
    }
    try {
        // database mei store karo
        await User.create({ name, email, password });

        // success message
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        // Error handling for DB operation
        res.status(500).json({ message: "Error creating user", "error": error.message });
    }
}

async function updateUser(req, res) {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true // Ensure validation is applied
        });

        // check if the user exists
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // success message
        res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", "error": error.message });
    }
}

async function deleteUser(req, res) {
    try {
        // find by id and delete
        await User.findByIdAndDelete(req.params.id);
        // success message
        res.status(200).json({ "message": "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ "message": "Error deleting user", "error": error.message })
    }

}

module.exports = {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser

}