const User = require("../models/userModel.js");
const Blog = require("../models/blogModel.js");
const Comment = require("../models/commentModel.js");
const bcrypt = require("bcrypt");
const { generateToken, validToken } = require("../utils/generateToken.js");
const {
    sendVerificationMail,
    sendForgetPasswordEmail,
} = require("../utils/emailService.js");
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
        return res.status(500).json({
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
            .populate({
                path: "blogs",
                populate: {
                    path: "creator",
                    select: "name username profilePic",
                },
            })
            .populate({
                path: "likedBlogs",
                populate: {
                    path: "creator",
                    select: "name username profilePic",
                },
            })
            .populate({
                path: "savedBlogs",
                populate: {
                    path: "creator",
                    select: "name username profilePic",
                },
            })
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
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message,
        });
    }
}

// signup
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


        // email and passwprd validation
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 6-20 characters long, include uppercase, lowercase, number, and special character.",
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
        return res.status(500).json({
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

        // username generation for google users 
        const username = email.split("@")[0] + uuidv4().substring(0, 6);

        // user nhi hai toh banao
        let newUser = await User.create({
            name,
            email,
            username,
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

    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address",
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
                "name email bio blogs followers following username password profilePic isVerified isGoogleAuth likedBlogs savedBlogs isTempPassword tempPasswordExpiry"
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
                message: "Invalid email or password",
            });
        }

        if (checkExistingUser.isGoogleAuth) {
            return res.status(400).json({
                success: false,
                message: 'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
            });
        }
        // Add after finding user (line ~55)
        if (!checkExistingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before logging in",
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
                message: "Incorrect password",
            });
        }

        // todo: password validation
        // #, a, A, 1, 6-20 chars

        // If it's a temporary password
        if (checkExistingUser.isTempPassword) {
            if (Date.now() > checkExistingUser.tempPasswordExpiry) {
                return res.status(400).json({
                    success: false,
                    message: "Temporary password expired. Please request a new one.",
                });
            }

            // generate token -> user login hone par
            const token = generateToken({
                id: checkExistingUser._id,
                email: checkExistingUser.email,
            });

            return res.status(200).json({
                success: true,
                message: "Login success with temporary password. Please reset immediately.",
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
        }

        // login using password set by the user
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

// Check Username Availability
async function checkUsernameAvailability(req, res) {
    try {
        const { username } = req.params;
        const { currentUserId } = req.query;

        // Basic validation
        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required",
            });
        }

        // Username validation rules - Only alphanumeric
        const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                available: false,
                message: "Username can only contain letters and numbers",
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                available: false,
                message: "Username must be at least 3 characters long",
            });
        }

        if (username.length > 30) {
            return res.status(400).json({
                success: false,
                available: false,
                message: "Username must be less than 30 characters",
            });
        }

        // Check if username exists (excluding current user if editing)
        // Case insensitive
        const query = { username: { $regex: new RegExp(`^${username}$`, "i") } };
        // edge case: jab user khud ka hi username edit kar raha hai toh uske exclude karke baakiyo se match karo
        if (currentUserId) {
            query._id = { $ne: currentUserId };
        }

        const existingUser = await User.findOne(query);

        if (existingUser) {
            return res.status(200).json({
                success: true,
                available: false,
                message: "Username is already taken",
            });
        }

        // Check for reserved usernames (optional)
        const reservedUsernames = [
            "admin",
            "api",
            "www",
            "com",
            "mail",
            "ftp",
            "localhost",
            "root",
            "support",
            "help",
            "blog",
            "news",
            "shop",
            "store",
            "app",
            "mobile",
            "about",
            "contact",
            "privacy",
            "terms",
            "login",
            "signup",
            "register",
            "profile",
            "settings",
            "dashboard",
        ];

        if (reservedUsernames.includes(username.toLowerCase())) {
            return res.status(200).json({
                success: true,
                available: false,
                message: "This username is reserved and cannot be used",
            });
        }

        return res.status(200).json({
            success: true,
            available: true,
            message: "Username is available! ✓",
        });
    } catch (error) {
        console.log("Username check error:", error);
        return res.status(500).json({
            success: false,
            message: "Error checking username availability",
            error: error.message,
        });
    }
}

async function updateUser(req, res) {
    try {
        const { id: userId } = req.params;
        const { name, username, bio, profilePic } = req.body;

        const userImage = req.file;
        // console.log(userImage);

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

// delete user controller
async function deleteUser(req, res) {
    try {
        const userId = req.user;
        const user = await User.findById(userId);

        // pehle blogs fetch karo
        const blogs = await Blog.find({ _id: { $in: user.blogs } });

        // cloudinary images delete karo
        for (const blog of blogs) {
            // main image
            if (blog.imageId) {
                try {
                    await cloudinaryDestroyImage(blog.imageId);
                } catch (cloudinaryError) {
                    console.error(
                        "Error deleting main image from Cloudinary:",
                        cloudinaryError
                    );
                }
            }

            // content images
            if (blog.content.blocks) {
                const contentImages = blog.content.blocks
                    .filter((block) => block.type === "image" && block.data.file.imageId)
                    .map((block) => block.data.file.imageId);

                if (contentImages.length > 0) {
                    try {
                        await Promise.all(
                            contentImages.map((id) => cloudinaryDestroyImage(id))
                        );
                    } catch (cloudinaryError) {
                        console.error(
                            "Error deleting content images from Cloudinary:",
                            cloudinaryError
                        );
                    }
                }
            }
        }

        // ab DB se blogs delete karo
        await Blog.deleteMany({ _id: { $in: user.blogs } });

        // likedBy / savedBy clean up
        await Blog.updateMany({ likedBy: userId }, { $pull: { likedBy: userId } });
        await Blog.updateMany({ savedBy: userId }, { $pull: { savedBy: userId } });

        // followers / following clean up
        await User.updateMany({ followers: userId }, { $pull: { followers: userId } });
        await User.updateMany({ following: userId }, { $pull: { following: userId } });

        // user ke comments delete karo
        await Comment.deleteMany({ user: userId });

        // finally user delete
        await User.findByIdAndDelete(userId);
        // delete user profile pic
        await cloudinaryDestroyImage(user.profilePicId);

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

async function userSettings(req, res) {
    try {
        const { username } = req.params;
        const { showLiked, showDraft, showSaved } = req.body;

        console.log("body", req.body);

        // find user
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exists",
            });
        }

        // update
        user.showLikedBlogs = showLiked;
        user.showDraftBlogs = showDraft;
        user.showSavedBlogs = showSaved;

        await user.save();

        // success message
        return res.status(200).json({
            success: true,
            message: "Settings saved successfully",
            user: {
                name: user.name,
                username: user.username,
                showLikedBlogs: user.showLikedBlogs,
                showDraftBlogs: user.showDraftBlogs,
                showSavedBlogs: user.showSavedBlogs,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error saving settings",
            error: error.message,
        });
    }
}

// reset user password
async function resetUserPassword(req, res) {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const { id: userId } = req.params;

        //  Basic validation - req.body empty check
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //  Find user
        const user = await User.findById(userId).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid User",
            });
        }

        // Google auth check
        if (user.isGoogleAuth) {
            return res.status(400).json({
                success: false,
                message: "Cannot reset password for Google authenticated users",
            });
        }

        // Check current password
        const isSamePassword = await bcrypt.compare(currentPassword, user.password);
        if (!isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Current Password",
            });
        }

        // New password !== confirm password
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm Password do not match",
            });
        }

        // New password !== confirm password
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password should be different than the Current Password",
            });
        }

        //  Password strength check
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 6-20 characters long, include at least one uppercase, one lowercase, one number, and one special character.",
            });
        }

        // Hash & update
        const hashedPass = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(
            userId, {
                password: hashedPass,
                isTempPassword: false,
                tempPasswordExpiry: null,
            }, { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error resetting password",
            error: error.message,
        });
    }
}

// forget user password
async function forgetUserPassword(req, res) {
    try {
        const { email } = req.body;

        // Basic validation - req.body empty check
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is empty",
            });
        }

        // email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "We've sent password reset instructions to your email if it's registered with us.",
            });
        }

        // Google auth check
        if (user.isGoogleAuth) {
            return res.status(400).json({
                success: false,
                message: "You are already authenticated via Google",
            });
        }

        // not verified email
        if (!user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email first",
            });
        }

        // abb mail bhej do
        const randPassword = await sendForgetPasswordEmail(user);

        // hash the password
        const hashedPassword = await bcrypt.hash(randPassword, 10);

        // update
        await User.findOneAndUpdate({ email }, {
            password: hashedPassword,
            isTempPassword: true,
            tempPasswordExpiry: Date.now() + 5 * 60 * 1000,
        });

        // console.log(randPassword)

        return res.status(200).json({
            success: true,
            message: "Temporary password sent to your email. Please reset after login.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error generating temporary password",
            error: error.message,
        });
    }
}

module.exports = {
    getUser,
    getUserById,
    createUser,
    checkUsernameAvailability,
    updateUser,
    deleteUser,
    loginUser,
    verifyEmail,
    googleAuth,
    followCreator,
    userSettings,
    resetUserPassword,
    forgetUserPassword,
};