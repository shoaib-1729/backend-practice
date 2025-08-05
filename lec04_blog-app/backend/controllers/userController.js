const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const { generateToken, validToken } = require("../utils/generateToken.js");
<<<<<<< HEAD
const sendVerificationMail = require("../utils/emailService.js");
const { getAuth } = require("firebase-admin/auth");
const { v4: uuidv4 } = require("uuid");
const {
    cloudinaryImageUpload,
    cloudinaryDestroyImage,
} = require("../config/cloudinaryConfig.js");
=======
const sendVerificationMail = require("../utils/emailService.js")
const { getAuth } = require("firebase-admin/auth");
const { v4: uuidv4 } = require('uuid');
const { cloudinaryImageUpload, cloudinaryDestroyImage } = require("../config/cloudinaryConfig.js");




>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

async function getUser(req, res) {
    try {
        const users = await User.find({});
        // get the users
<<<<<<< HEAD
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
=======
        return res.json({ "success": true, "message": "Users fetched successfully", users });
    } catch (error) {
        return res.status(500).json({ "success": false, "message": "Error fetching users", "error": error.message });
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    }
}

async function getUserById(req, res) {
    try {
        const { username } = req.params;

<<<<<<< HEAD
        const user = await User.findOne({ username })
            .populate("blogs following likedBlogs savedBlogs")
            .populate({
                path: "followers following",
                select: "name username email",
=======
        const user = await User.findOne({ username }).populate("blogs following likedBlogs savedBlogs")
            .populate({
                path: "followers following",
                select: "name username email"
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            })
            .select("-email -__v");

        // get the users
<<<<<<< HEAD
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
=======
        return res.json({ "success": true, "message": "Users fetched successfully", user });
    } catch (error) {
        return res.status(500).json({ "success": false, "message": "Error fetching users", "error": error.message });
    }

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
}

async function createUser(req, res) {
    try {
        const { name, email, password } = req.body;

        // error handling
        if (!name) {
            return res.status(400).json({
<<<<<<< HEAD
                success: false,
                message: "Please enter the name",
=======
                "success": false,
                "message": "Please enter the name"
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            });
        }
        if (!email) {
            return res.status(400).json({
<<<<<<< HEAD
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
=======
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
        const checkExistingUser = await User.findOne({ email }).select("name bio email followers following password isVerified isGoogleAuth");



        // if found -> early return
        if (checkExistingUser) {

            if (checkExistingUser.isGoogleAuth) {
                return res.status(400).json({
                    success: false,
                    message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.'
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                });
            }

            if (checkExistingUser.isVerified) {
                return res.status(400).json({
<<<<<<< HEAD
                    success: false,
                    message: "User already registered with this email",
                });
            } else {
                await sendVerificationMail(checkExistingUser);

                // success message
                return res.status(200).json({
                    success: true,
                    message: "Please check your email to verify your account",
=======
                    "success": false,
                    "message": "User already registered with this email"
                })
            } else {

                await sendVerificationMail(checkExistingUser)

                // success message
                return res.status(200).json({
                    "success": true,
                    "message": "Please check your email to verify your account",
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                });
            }
        }

        // hash password using bcrypt jab user create ho
<<<<<<< HEAD
        const hashedPass = await bcrypt.hash(password, 10);
        // generate random username
        const username = email.split("@")[0] + uuidv4().substring(0, 6);
=======
        const hashedPass = await bcrypt.hash(password, 10)
            // generate random username
        const username = email.split("@")[0] + uuidv4().substring(0, 6)

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        // database mei store karo with hashed password
        const newUser = await User.create({
            name,
            email,
            password: hashedPass,
<<<<<<< HEAD
            username,
=======
            username
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });

        await sendVerificationMail(newUser);

        // success message
        return res.status(200).json({
<<<<<<< HEAD
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
=======
            "success": true,
            "message": "Please check your email to verify your account",
        });
    } catch (error) {
        // Error handling for DB operation
        return res.status(500).json({ "success": false, "message": "Error creating user", "error": error.message });
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    }
}

async function verifyEmail(req, res) {
    try {
<<<<<<< HEAD
        const { verificationToken } = req.params;

        const verifyToken = validToken(verificationToken);
=======

        const { verificationToken } = req.params;

        const verifyToken = validToken(verificationToken)
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        if (!verifyToken) {
            return res.status(400).json({
                success: false,
<<<<<<< HEAD
                message: "Invalid Token/Email expired",
            });
=======
                message: "Invalid Token/Email expired"
            })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        }
        const { id } = verifyToken;

        const user = await User.findByIdAndUpdate(
            id, { isVerified: true }, { new: true }
        );

        if (!user) {
            return res.status(400).json({
                success: false,
<<<<<<< HEAD
                message: "User Not Exists",
            });
=======
                message: "User Not Exists"
            })

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        }

        return res.status(200).json({
            success: true,
<<<<<<< HEAD
            message: "Email verified successfully",
        });
=======
            message: "Email verified successfully"
        })

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
<<<<<<< HEAD
            error: err.message,
        });
    }
}

=======
            error: err.message
        })

    }
}



>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
// google auth
async function googleAuth(req, res) {
    try {
        const { accessToken } = req.body;

        // check token validity
        const response = await getAuth().verifyIdToken(accessToken);

        // user ka data nikalo
        const { name, email } = response;

<<<<<<< HEAD
        // user exists karta hai
        const user = await User.findOne({ email });
=======
        // user exists karta hai 
        const user = await User.findOne({ email })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        // handle validations
        if (user) {
            if (user.isGoogleAuth) {
                // already registered via google auth
                let token = generateToken({
                    email: user.email,
<<<<<<< HEAD
                    id: user._id,
                });
=======
                    id: user._id
                })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

                return res.status(200).json({
                    success: true,
                    message: "Logged in successfully",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
<<<<<<< HEAD
                        token,
                    },
                });
=======
                        token
                    }
                })

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            } else {
                return res.status(400).json({
                    success: true,
                    message: "This email is already registered using a password. Please log in using the login form.",
<<<<<<< HEAD
                });
=======
                })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            }
        }

        // user nhi hai toh banao
        let newUser = await User.create({
            name,
            email,
            isVerified: true,
<<<<<<< HEAD
            isGoogleAuth: true,
=======
            isGoogleAuth: true
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });

        // generate token
        let token = generateToken({
            email: newUser.email,
<<<<<<< HEAD
            id: newUser._id,
        });
=======
            id: newUser._id
        })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        return res.status(200).json({
            success: true,
            message: "Registration successful! You’ve signed up using your Google account.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
<<<<<<< HEAD
                token,
            },
        });
=======
                token
            }
        })

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Please try again",
<<<<<<< HEAD
            error: err.message,
        });
    }
}

=======
            error: err.message
        })
    }
}



>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
// login
async function loginUser(req, res) {
    const { email, password } = req.body;

    // custom validations
    if (!email) {
        return res.status(400).json({
<<<<<<< HEAD
            success: false,
            message: "Please enter the email",
        });
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Please enter the password",
=======
            "success": false,
            "message": "Please enter the email"
        });

    }
    if (!password) {
        return res.status(400).json({
            "success": false,
            "message": "Please enter the password"
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });
    }

    try {
<<<<<<< HEAD
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
=======

        // check if user exits already in DB
        const checkExistingUser = await User.findOne({ email }).select("name email bio followers following username password profilePic isVerified isGoogleAuth");

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        // if user not found in DB -> early return
        if (!checkExistingUser) {
            return res.status(400).json({
<<<<<<< HEAD
                success: false,
                message: "User does not exists",
            });
=======
                "success": false,
                "message": "User does not exists"
            })
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        }

        if (checkExistingUser.isGoogleAuth) {
            return res.status(400).json({
                success: false,
<<<<<<< HEAD
                message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
=======
                message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.'
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            });
        }
        // user exists in DB -> verify password
        // if not same -> early return

        // to compare actual password of user & hashed password in DB -> use bcrypt
<<<<<<< HEAD
        const verifyPass = await bcrypt.compare(
            password,
            checkExistingUser.password
        );
=======
        const verifyPass = await bcrypt.compare(password, checkExistingUser.password)
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        // password not verified -> early return
        if (!verifyPass) {
            return res.status(400).json({
<<<<<<< HEAD
                success: false,
                message: "Incorrect Password",
            });
        }

=======
                "success": false,
                "message": "Incorrect Password"
            })
        }


>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        if (!checkExistingUser.isVerified) {
            await sendVerificationMail(checkExistingUser);

            return res.status(400).json({
                success: false,
                message: "Please verify your email",
            });
        }

<<<<<<< HEAD
=======


>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        // todo: password validation
        // #, a, A, 1, 6-20 chars

        // generate token -> user login hone par
        const token = generateToken({
            id: checkExistingUser._id,
<<<<<<< HEAD
            email: checkExistingUser.email,
        });

        // success message
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
=======
            email: checkExistingUser.email
        });


        // success message
        return res.status(200).json({
            "success": true,
            "message": "User logged in successfully",
            "user": {
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                id: checkExistingUser._id,
                name: checkExistingUser.name,
                email: checkExistingUser.email,
                profilePic: checkExistingUser.profilePic,
                username: checkExistingUser.username,
                bio: checkExistingUser.bio,
                followers: checkExistingUser.followers,
                following: checkExistingUser.following,
<<<<<<< HEAD
                blogs: checkExistingUser.blogs,
                likedBlogs: checkExistingUser.likedBlogs,
                savedBlogs: checkExistingUser.savedBlogs,
                token,
=======
                token
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            },
        });
    } catch (error) {
        console.log(error);
        // Error handling for DB operation
        return res.status(500).json({
<<<<<<< HEAD
            success: false,
            message: "Error logging user",
            error: error.message,
=======
            "success": false,
            "message": "Error logging user",
            "error": error.message
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });
    }
}

<<<<<<< HEAD
=======


>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
async function updateUser(req, res) {
    try {
        const { id: userId } = req.params;
        const { name, username, bio, profilePic } = req.body;

<<<<<<< HEAD
        console.log(req.body);
        const userImage = req.file;
        console.log(userImage);

=======
        console.log(req.body)
        const userImage = req.file;
        console.log(userImage);


>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        // find user
        const user = await User.findById(userId);

        // agar user image ko delete karna chahe toh pehle hi pakad lo
        if (profilePic === "null" || profilePic === null) {
            if (user.profilePicId) {
                await cloudinaryDestroyImage(user.profilePicId);
                user.profilePic = null;
                user.profilePicId = null;
            }
        }

<<<<<<< HEAD
        if (userImage) {
            // cloudinary image upload
            const { secure_url, public_id } = await cloudinaryImageUpload(
                `data:image/jpeg;base64,${userImage.buffer.toString("base64")}`
=======

        if (userImage) {
            // cloudinary image upload
            const { secure_url, public_id } = await cloudinaryImageUpload(
                `data:image/jpeg;base64,${userImage.buffer.toString(
                    "base64"
                    )}`
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            );

            // set to schema
            user.profilePic = secure_url;
            user.profilePicId = public_id;
        }

<<<<<<< HEAD
=======

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        // TODO: validations

        // username change karna hai
        if (username !== user.username) {
            // kya koi aur user hai same username se
<<<<<<< HEAD
            const existingUser = await User.findOne({ username });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken",
=======
            const existingUser = await User.findOne({ username })

            if (existingUser) {
                return res.status(400).json({
                    "success": false,
                    "message": "Username already taken",
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
                });
            }
            // change username
            user.username = username;
        }

        user.name = name;
        user.bio = bio;

        await user.save();

<<<<<<< HEAD
        // success message
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
=======

        // success message
        return res.status(200).json({
            "success": true,
            "message": "User updated successfully",
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
            user: {
                name: user.name,
                username: user.username,
                bio: user.bio,
<<<<<<< HEAD
                profilePic: user.profilePic,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message,
=======
                profilePic: user.profilePic
            }
        });
    } catch (error) {
        return res.status(500).json({
            "success": false,
            "message": "Error updating user",
            "error": error.message
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });
    }
}

<<<<<<< HEAD
=======

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
async function deleteUser(req, res) {
    try {
        // find by id and delete
        await User.findByIdAndDelete(req.params.id);
        // success message
        return res.status(200).json({
<<<<<<< HEAD
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

=======
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



>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
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
<<<<<<< HEAD
        const message =
            action === "following" ?
            `Success! You're now following ${creator.name}.` :
            `You unfollowed ${creator.name}.`;
=======
        const message = action === "following" ? `Success! You're now following ${creator.name}.` : `You unfollowed ${creator.name}.`;
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed

        return res.status(200).json({
            success: true,
            message,
            user: updatedUser,
        });
<<<<<<< HEAD
=======

>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error following blog creator",
<<<<<<< HEAD
            error: err.message,
=======
            error: err.message
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
        });
    }
}

<<<<<<< HEAD
=======


>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
module.exports = {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    verifyEmail,
    googleAuth,
<<<<<<< HEAD
    followCreator,
=======
    followCreator
>>>>>>> 257519a267a29179e6cd778827ff45674ffe0fed
};