// business logic
const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { generateToken, validToken } = require("../utils/generateToken.js");
const transporter = require("../utils/mailTransporter.js");
const sendVerificationMail = require("../utils/emailService.js")

async function getUser(req, res) {
    try {
        const users = await User.find({});
        // get the users
        return res.json({ "success": true, "message": "Users fetched successfully", users });
    } catch (error) {
        return res.status(500).json({ "success": false, "message": "Error fetching users", "error": error.message });
    }
}

async function getUserById(req, res) {
    try {
        const users = await User.findById(req.params.id);
        // get the users
        return res.json({ "success": true, "message": "Users fetched successfully", users });
    } catch (error) {
        return res.status(500).json({ "success": false, "message": "Error fetching users", "error": error.message });
    }

}

async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // error handling
        if (!name) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the name"
            });
        }
        if (!email) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the email"
            });

        }
        if (!password) {
            return res.status(400).json({
                "success": false,
                "message": "Please enter the password"
            });
        }
        // check if user exits already in DB
        const checkExistingUser = await User.findOne({ email });

        // if found -> early return
        if (checkExistingUser) {

            if (checkExistingUser.isVerify) {
                return res.status(400).json({
                    "success": false,
                    "message": "User already registered with this email"
                })
            } else {
                await sendVerificationMail(checkExistingUser)

                // success message
                return res.status(200).json({
                    "success": true,
                    "message": "Please check your email to verify your account",
                });
            }
        }

        // hash password using bcrypt jab user create ho
        const hashedPass = await bcrypt.hash(password, 10)

        // database mei store karo with hashed password
        const newUser = await User.create({ name, email, password: hashedPass });

        await sendVerificationMail(newUser);

        // success message
        return res.status(200).json({
            "success": true,
            "message": "Please check your email to verify your account",
        });
    } catch (error) {
        // Error handling for DB operation
        return res.status(500).json({ "success": false, "message": "Error creating user", "error": error.message });
    }
}

async function verifyToken(req, res) {
    try {

        const { verificationToken } = req.params;

        const verifyToken = validToken(verificationToken)

        if (!verifyToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid Token/Email expired"
            })
        }
        const { id } = verifyToken;

        const user = await User.findByIdAndUpdate(
            id, { isVerify: true }, { new: true }
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Exists"
            })

        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
            error: err.message
        })

    }
}



// login
async function loginUser(req, res) {
    const { email, password } = req.body;

    // custom validations
    if (!email) {
        return res.status(400).json({
            "success": false,
            "message": "Please enter the email"
        });

    }
    if (!password) {
        return res.status(400).json({
            "success": false,
            "message": "Please enter the password"
        });
    }
    try {

        // check if user exits already in DB
        const checkExistingUser = await User.findOne({ email });

        // generate token -> user login hone par
        const token = generateToken({
            id: checkExistingUser._id,
            email: checkExistingUser.email
        });

        // if user not found in DB -> early return
        if (!checkExistingUser) {
            return res.status(400).json({
                "success": false,
                "message": "User does not exists"
            })
        }

        // user exists in DB -> verify password
        // if not same -> early return

        // to compare actual password of user & hashed password in DB -> use bcrypt
        const verifyPass = await bcrypt.compare(password, checkExistingUser.password)

        // password not verified -> early return
        if (!verifyPass) {
            return res.status(400).json({
                "success": false,
                "message": "Incorrect Password"
            })
        }

        if (!checkExistingUser.isVerify) {
            await sendVerificationMail(checkExistingUser);

            return res.status(400).json({
                success: false,
                message: "Please verify your email",
            });
        }

        // todo: password validation
        // #, a, A, 1, 6-20 chars


        // success message
        return res.status(200).json({
            "success": true,
            "message": "User logged in successfully",
            "user": {
                id: checkExistingUser._id,
                name: checkExistingUser.name,
                email: checkExistingUser.email,
                token
            },
        });
    } catch (error) {
        // Error handling for DB operation
        return res.status(500).json({
            "success": false,
            "message": "Error logging user",
            "error": error.message
        });
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
        return res.status(200).json({
            "success": true,
            "message": "User updated successfully",
            "user": updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": "Error updating user",
            "error": error.message
        });
    }
}

async function deleteUser(req, res) {
    try {
        // find by id and delete
        await User.findByIdAndDelete(req.params.id);
        // success message
        return res.status(200).json({
            "success": true,
            "message": "User deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": "Error deleting user",
            "error": error.message
        })
    }

}

module.exports = {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    verifyToken
};