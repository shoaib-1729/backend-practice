const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { generateToken, validToken } = require("../utils/generateToken.js");
const sendVerificationMail = require("../utils/emailService.js");
const { getAuth } = require("firebase-admin/auth");
const { v4: uuidv4 } = require("uuid");
const {
    cloudinaryImageUpload,
    cloudinaryDestroyImage,
} = require("../config/cloudinaryConfig.js");

async function getUser(req, res) {
    try {
        const users = await User.find({});
        // get the users
        return res.json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Error fetching users",
                error: error.message,
            });
    }
}

async function getUserById(req, res) {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .populate("blogs following likedBlogs savedBlogs")
            .populate({
                path: "followers following",
                select: "name username email",
            })
            .select("-email -__v");

        // get the users
        return res.json({
            success: true,
            message: "Users fetched successfully",
            user,
        });
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Error fetching users",
                error: error.message,
            });
    }
}

async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // error handling
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Please enter the name",
            });
        }
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter the email",
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Please enter the password",
            });
        }
        // check if user exits already in DB
        const checkExistingUser = await User.findOne({ email }).select(
            "name bio email followers following password isVerified isGoogleAuth"
        );

        // if found -> early return
        if (checkExistingUser) {
            if (checkExistingUser.isGoogleAuth) {
                return res.status(400).json({
                    success: false,
                    message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
                });
            }

            if (checkExistingUser.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "User already registered with this email",
                });
            } else {
                await sendVerificationMail(checkExistingUser);

                // success message
                return res.status(200).json({
                    success: true,
                    message: "Please check your email to verify your account",
                });
            }
        }

        // hash password using bcrypt jab user create ho
        const hashedPass = await bcrypt.hash(password, 10);
        // generate random username
        const username = email.split("@")[0] + uuidv4().substring(0, 6);

        // database mei store karo with hashed password
        const newUser = await User.create({
            name,
            email,
            password: hashedPass,
            username,
        });

        await sendVerificationMail(newUser);

        // success message
        return res.status(200).json({
            success: true,
            message: "Please check your email to verify your account",
        });
    } catch (error) {
        // Error handling for DB operation
        return res
            .status(500)
            .json({
                success: false,
                message: "Error creating user",
                error: error.message,
            });
    }
}

async function verifyEmail(req, res) {
    try {
        const { verificationToken } = req.params;

        const verifyToken = validToken(verificationToken);

        if (!verifyToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid Token/Email expired",
            });
        }
        const { id } = verifyToken;

        const user = await User.findByIdAndUpdate(
            id, { isVerified: true }, { new: true }
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Exists",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
            error: err.message,
        });
    }
}

// google auth
async function googleAuth(req, res) {
    try {
        const { accessToken } = req.body;

        // check token validity
        const response = await getAuth().verifyIdToken(accessToken);

        // user ka data nikalo
        const { name, email } = response;

        // user exists karta hai
        const user = await User.findOne({ email });

        // handle validations
        if (user) {
            if (user.isGoogleAuth) {
                // already registered via google auth
                let token = generateToken({
                    email: user.email,
                    id: user._id,
                });

                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        token,
                    },
                });
            } else {
                return res.status(400).json({
                    success: true,
                    message: "This email is already registered using a password. Please log in using the login form.",
                });
            }
        }

        // user nhi hai toh banao
        let newUser = await User.create({
            name,
            email,
            isVerified: true,
            isGoogleAuth: true,
        });

        // generate token
        let token = generateToken({
            email: newUser.email,
            id: newUser._id,
        });

        return res.status(200).json({
            success: true,
            message: "Registration successful! You’ve signed up using your Google account.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                token,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
            error: err.message,
        });
    }
}

// login
async function loginUser(req, res) {
    const { email, password } = req.body;

    // custom validations
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Please enter the email",
        });
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Please enter the password",
        });
    }

    try {
        // check if user exits already in DB
        const checkExistingUser = await User.findOne({ email })
            .select(
                "name email bio blogs followers following username password profilePic isVerified isGoogleAuth likedBlogs savedBlogs"
            )
            .populate({
                path: "blogs",
                populate: {
                    path: "creator",
                    select: "name username email",
                },
            })
            .populate({
                path: "savedBlogs",
                populate: {
                    path: "creator",
                    select: "name username email",
                },
            })
            .populate({
                path: "likedBlogs",
                populate: {
                    path: "creator",
                    select: "name username email",
                },
            });

        // console.log(checkExistingUser)

        // if user not found in DB -> early return
        if (!checkExistingUser) {
            return res.status(400).json({
                success: false,
                message: "User does not exists",
            });
        }

        if (checkExistingUser.isGoogleAuth) {
            return res.status(400).json({
                success: false,
                message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
            });
        }
        // user exists in DB -> verify password
        // if not same -> early return

        // to compare actual password of user & hashed password in DB -> use bcrypt
        const verifyPass = await bcrypt.compare(
            password,
            checkExistingUser.password
        );

        // password not verified -> early return
        if (!verifyPass) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password",
            });
        }

        if (!checkExistingUser.isVerified) {
            await sendVerificationMail(checkExistingUser);

            return res.status(400).json({
                success: false,
                message: "Please verify your email",
            });
        }

        // todo: password validation
        // #, a, A, 1, 6-20 chars

        // generate token -> user login hone par
        const token = generateToken({
            id: checkExistingUser._id,
            email: checkExistingUser.email,
        });

        // success message
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: checkExistingUser._id,
                name: checkExistingUser.name,
                email: checkExistingUser.email,
                profilePic: checkExistingUser.profilePic,
                username: checkExistingUser.username,
                bio: checkExistingUser.bio,
                followers: checkExistingUser.followers,
                following: checkExistingUser.following,
                blogs: checkExistingUser.blogs,
                likedBlogs: checkExistingUser.likedBlogs,
                savedBlogs: checkExistingUser.savedBlogs,
                token,
            },
        });
    } catch (error) {
        console.log(error);
        // Error handling for DB operation
        return res.status(500).json({
            success: false,
            message: "Error logging user",
            error: error.message,
        });
    }
}

async function updateUser(req, res) {
    try {
        const { id: userId } = req.params;
        const { name, username, bio, profilePic } = req.body;

        console.log("body", req.body);
        const userImage = req.file;
        // console.log(userImage);

        // find user
        const user = await User.findById(userId);


        // agar user image ko delete karna chahe toh pehle hi pakad lo
        if (profilePic === "null" || profilePic === null) {

            if (user.profilePicId) {
                console.log("hello2")
                await cloudinaryDestroyImage(user.profilePicId);
                user.profilePic = null;
                user.profilePicId = null;
            }
        }

        if (userImage) {
            // cloudinary image upload
            const { secure_url, public_id } = await cloudinaryImageUpload(
                `data:image/jpeg;base64,${userImage.buffer.toString("base64")}`
            );

            // set to schema
            user.profilePic = secure_url;
            user.profilePicId = public_id;
        }

        // TODO: validations

        // username change karna hai
        if (username !== user.username) {
            // kya koi aur user hai same username se
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken",
                });
            }
            // change username
            user.username = username;
        }

        user.name = name;
        user.bio = bio;

        await user.save();

        // success message
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: {
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message,
        });
    }
}


// async function updateUser(req, res) {
//     try {
//         const { id: userId } = req.params;
//         const { name, username, bio, profilePic } = req.body;
//         const userImage = req.file;

//         console.log("Incoming body:", req.body);
//         console.log("Incoming file:", userImage);

//         // Find the user first
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }

//         // Validation: name and username are required
//         if (!name || !username) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Name and username are required",
//             });
//         }

//         // If profilePic is "null" string or null, remove existing image
//         if (profilePic === "null" || profilePic === null) {
//             if (user.profilePicId) {
//                 await cloudinaryDestroyImage(user.profilePicId);
//                 user.profilePic = null;
//                 user.profilePicId = null;
//             }
//         }

//         // If a new image is uploaded
//         if (userImage) {
//             const { secure_url, public_id } = await cloudinaryImageUpload(
//                 `data:image/jpeg;base64,${userImage.buffer.toString("base64")}`
//             );
//             user.profilePic = secure_url;
//             user.profilePicId = public_id;
//         }

//         // Username check only if it's changed
//         if (username !== user.username) {
//             const existingUser = await User.findOne({ username });
//             if (existingUser) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Username already taken",
//                 });
//             }
//             user.username = username;
//         }

//         // Update other fields
//         user.name = name;
//         user.bio = bio;

//         // Save updated user
//         await user.save();

//         return res.status(200).json({
//             success: true,
//             message: "User updated successfully",
//             user: {
//                 name: user.name,
//                 username: user.username,
//                 bio: user.bio,
//                 profilePic: user.profilePic,
//             },
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Error updating user",
//             error: error.message,
//         });
//     }
// }



async function deleteUser(req, res) {
    try {
        // find by id and delete
        await User.findByIdAndDelete(req.params.id);
        // success message
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message,
        });
    }
}

async function followCreator(req, res) {
    try {
        const { creatorId } = req.params;
        const userId = req.user;

        const creator = await User.findById(creatorId);

        if (!creator) {
            return res.status(400).json({
                success: false,
                message: "This creator does not exist",
            });
        }

        let action = "";
        if (!creator.followers.includes(userId)) {
            // FOLLOW
            await User.findByIdAndUpdate(creatorId, {
                $addToSet: { followers: userId },
            });
            await User.findByIdAndUpdate(userId, {
                $addToSet: { following: creatorId },
            });
            action = "following";
        } else {
            // UNFOLLOW
            await User.findByIdAndUpdate(creatorId, {
                $pull: { followers: userId },
            });
            await User.findByIdAndUpdate(userId, {
                $pull: { following: creatorId },
            });
            action = "unfollowed";
        }

        // 🟢 Fetch updated user
        const updatedUser = await User.findById(userId)
            .select("-password -__v -email")
            .populate("following", "name username");

        // dynamic message
        const message =
            action === "following" ?
            `Success! You're now following ${creator.name}.` :
            `You unfollowed ${creator.name}.`;

        return res.status(200).json({
            success: true,
            message,
            user: updatedUser,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error following blog creator",
            error: err.message,
        });
    }
}

module.exports = {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    verifyEmail,
    googleAuth,
    followCreator,
};