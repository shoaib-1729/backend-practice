const User = require("../models/userModel.js");
const Blog = require("../models/blogModel.js");
const Comment = require("../models/commentModel.js");
const bcrypt = require("bcrypt");
const { generateToken, validToken } = require("../utils/generateToken.js");
const {
  sendVerificationEmail,
  sendForgetPasswordEmail,
} = require("../utils/emailService.js");
const { admin, isInitialized } = require("../config/firebase-admin.js");
const { v4: uuidv4 } = require("uuid");
const {
  cloudinaryImageUpload,
  cloudinaryDestroyImage,
} = require("../config/cloudinaryConfig.js");
const logger = require("../utils/logger");

async function getUser(req, res) {
  try {
    const users = await User.find({});
    // get the users
    return res.json({
      success: true,
      message: "Users loaded",
      users,
    });
  } catch (error) {
    logger.error("Error fetching users", error);
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
      .select(
        "name email bio blogs followers following username password profilePic likedBlogs savedBlogs showLikedBlogs showSavedBlogs showDraftBlogs "
      )
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
        select: "name username email profilePic",
      });
    // get the users
    return res.json({
      success: true,
      message: "Profile loaded",
      user,
    });
  } catch (error) {
    logger.error("Error fetching users", error);
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
        message:
          "Password must be 6-20 characters long, include uppercase, lowercase, number, and special character.",
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
          message:
            'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
        });
      }

      if (checkExistingUser.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already registered with this email",
        });
      } else {
        await sendVerificationEmail(checkExistingUser);

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

    await sendVerificationEmail(newUser);

    // success message
    return res.status(200).json({
      success: true,
      message: "Please check your email to verify your account",
    });
  } catch (error) {
    logger.error("Error creating user", error);

    // Error handling for DB operation
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
}

// signin
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
        "name email bio blogs followers following username password profilePic isVerified isGoogleAuth likedBlogs savedBlogs showLikedBlogs showSavedBlogs showDraftBlogs isTempPassword tempPasswordExpiry"
      )
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
        select: "name username email profilePic",
      });

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
        message:
          'You\'ve already signed up with Google. Please use "Continue with Google" to sign in.',
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
        message:
          "Login success with temporary password. Please reset immediately.",
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
          showLikedBlogs: checkExistingUser.showLikedBlogs,
          showDraftBlogs: checkExistingUser.showDraftBlogs,
          showSavedBlogs: checkExistingUser.showSavedBlogs,
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
      message: "Logged in",
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
        showLikedBlogs: checkExistingUser.showLikedBlogs,
        showDraftBlogs: checkExistingUser.showDraftBlogs,
        showSavedBlogs: checkExistingUser.showSavedBlogs,
        token,
      },
    });
  } catch (error) {
    logger.error("Error logging user", error);
    // Error handling for DB operation
    return res.status(500).json({
      success: false,
      message: "Error logging user",
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
      id,
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Exists",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified",
    });
  } catch (err) {
    logger.error("Please try again", error);

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
    if (!isInitialized()) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please try again later.",
      });
    }

    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Verify the token using Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(accessToken);

    //  extract user info:
    const userName =
      decodedToken.name ||
      decodedToken.given_name + " " + decodedToken.family_name;
    const userEmail = decodedToken.email;

    // user exists karta hai
    const user = await User.findOne({ email: userEmail })
      .select(
        "name profilePic bio email username followers following password isVerified isGoogleAuth blogs savedBlogs likedBlogs"
      )
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
        select: "name username email profilePic",
      });

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
          message: "Logged in",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            profilePic: user.profilePic,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            blogs: user.blogs,
            likedBlogs: user.likedBlogs,
            savedBlogs: user.savedBlogs,
            token,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "This email is already registered. Please log in with your password.",
        });
      }
    }

    // username generation for google users
    const username = userEmail.split("@")[0] + uuidv4().substring(0, 6);

    let newUser = await User.create({
      name: userName,
      email: userEmail,
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
      message:
        "Registration successful! You've signed up using your Google account.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
        followers: newUser.followers,
        following: newUser.following,
        blogs: newUser.blogs,
        likedBlogs: newUser.likedBlogs,
        savedBlogs: newUser.savedBlogs,
        token,
      },
    });
  } catch (err) {
    logger.error("Google Auth Error:", err);
    return res.status(500).json({
      success: false,
      message: "Please try again",
      error: err.message,
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
    logger.error("Username check error:", error.message);
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

    // find user
    const updatedUser = await User.findById(userId)
      .select(
        "name email bio blogs followers following username password profilePic isVerified isGoogleAuth likedBlogs savedBlogs showLikedBlogs showSavedBlogs showDraftBlogs isTempPassword tempPasswordExpiry"
      )
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
        select: "name username email profilePic",
      });

    // success message
    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        username: updatedUser.username,
        bio: updatedUser.bio,
        followers: updatedUser.followers,
        following: updatedUser.following,
        blogs: updatedUser.blogs,
        likedBlogs: updatedUser.likedBlogs,
        savedBlogs: updatedUser.savedBlogs,
        showLikedBlogs: updatedUser.showLikedBlogs,
        showDraftBlogs: updatedUser.showDraftBlogs,
        showSavedBlogs: updatedUser.showSavedBlogs,
      },
    });
  } catch (error) {
    logger.error("Error updating user", error);
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

    // collect blog ID
    const blogIds = blogs.map((blog) => blog._id.toString());

    // cloudinary images delete karo
    for (const blog of blogs) {
      // main image
      if (blog.imageId) {
        try {
          await cloudinaryDestroyImage(blog.imageId);
        } catch (cloudinaryError) {
          logger.error(
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
            logger.error(
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

    // saved blog/liked blog clean up
    await User.updateMany(
      { savedBlogs: { $in: user.blogs } },
      { $pull: { savedBlogs: { $in: user.blogs } } }
    );
    await User.updateMany(
      { likedBlogs: { $in: user.blogs } },
      { $pull: { likedBlogs: { $in: user.blogs } } }
    );

    // followers / following clean up
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );

    // user ke comments delete karo
    await Comment.deleteMany({ user: userId });

    // finally user delete
    await User.findByIdAndDelete(userId);
    // delete user profile pic
    await cloudinaryDestroyImage(user.profilePicId);

    return res.status(200).json({
      success: true,
      message: "User removed",
      deletedBlogIds: blogIds,
    });
  } catch (error) {
    logger.error("Error deleting user", error);

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

    // Fetch updated user
    const updatedUser = await User.findById(userId)
      .select(
        "name email bio blogs followers following username profilePic likedBlogs savedBlog"
      )
      .populate({
        path: "blogs",
        populate: {
          path: "creator",
          select: "name username email profilePic",
        },
      })
      .populate({
        path: "savedBlogs",
        populate: {
          path: "creator",
          select: "name username email profilePic",
        },
      })
      .populate({
        path: "likedBlogs",
        populate: {
          path: "creator",
          select: "name username email profilePic",
        },
      })
      .populate({
        path: "followers following",
        select: "name username email profilePic",
      });

    // dynamic message
    const message =
      action === "following"
        ? `Success! You're now following ${creator.name}.`
        : `You unfollowed ${creator.name}.`;

    return res.status(200).json({
      success: true,
      message,
      user: updatedUser,
    });
  } catch (err) {
    logger.error("Error following blog creator", error);

    return res.status(500).json({
      success: false,
      message: "Error following blog creator",
      error: err.message,
    });
  }
}

// user setting controller
async function userSettings(req, res) {
  try {
    const { username } = req.params;
    const { showLiked, showDraft, showSaved } = req.body;

    // find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exists",
      });
    }

    // update user settings
    user.showLikedBlogs = showLiked;
    user.showDraftBlogs = showDraft;
    user.showSavedBlogs = showSaved;

    // Important Logic: Agar showDraft true hai toh saare draft blogs ko publish kardo
    if (showDraft === true) {
      // Find all blogs of this user where draft = true
      const draftBlogs = await Blog.find({
        creator: user._id,
        draft: true,
      });

      // Update all draft blogs to published (draft = false)
      if (draftBlogs.length > 0) {
        await Blog.updateMany(
          { creator: user._id, draft: true },
          { $set: { draft: false } }
        );
      }
    }

    await user.save();

    // find updated user with fresh blog data
    const updatedUser = await User.findOne({ username })
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
        select: "name username email profilePic",
      });

    // success message
    return res.status(200).json({
      success: true,
      message: "Settings saved",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        username: updatedUser.username,
        bio: updatedUser.bio,
        followers: updatedUser.followers,
        following: updatedUser.following,
        blogs: updatedUser.blogs,
        likedBlogs: updatedUser.likedBlogs,
        savedBlogs: updatedUser.savedBlogs,
        showLikedBlogs: updatedUser.showLikedBlogs,
        showDraftBlogs: updatedUser.showDraftBlogs,
        showSavedBlogs: updatedUser.showSavedBlogs,
      },
    });
  } catch (error) {
    logger.error("Error saving settings", error);

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
        message:
          "Password must be 6-20 characters long, include at least one uppercase, one lowercase, one number, and one special character.",
      });
    }

    // Hash & update
    const hashedPass = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPass,
        isTempPassword: false,
        tempPasswordExpiry: null,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset",
    });
  } catch (error) {
    logger.error("Error resetting password", error);
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
    const user = await User.findOne({ email }).select(
      "email isVerified isGoogleAuth"
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "We've sent password reset instructions to your email if it's registered with us.",
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
    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        isTempPassword: true,
        tempPasswordExpiry: Date.now() + 5 * 60 * 1000,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Temporary password sent to your email. Please reset after login.",
    });
  } catch (error) {
    logger.error("Error generating temporary password", error);
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
