const { validToken } = require("../utils/generateToken")

async function verifyUser(req, res, next) {
    try {
        // Check if authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({
                "success": false,
                "message": "Authorization header missing"
            })
        }

        // Extract token from headers
        const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader);

        // Check if header has Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                "success": false,
                "message": "Invalid token format. Use Bearer <token>"
            })
        }

        const token = authHeader.split(" ")[1];
        console.log("Extracted Token:", token);
        console.log("Token Length:", token.length);

        // Check if token exists after split
        if (!token) {
            return res.status(401).json({
                "success": false,
                "message": "Token not provided"
            })
        }

        try {
            // Debug: Log before validToken call
            console.log("Calling validToken with:", token.substring(0, 20) + "...");

            const userData = validToken(token);
            console.log("validToken returned:", userData);

            // Check userData
            if (!userData) {
                return res.status(401).json({
                    "success": false,
                    "message": "Invalid or expired token"
                })
            }

            // Check if userData has required properties
            if (!userData.id) {
                console.log("userData structure:", JSON.stringify(userData, null, 2));
                return res.status(401).json({
                    "success": false,
                    "message": "Invalid token payload - missing user ID"
                })
            }

            // Set user data to request
            req.user = userData.id;
            console.log("User ID set to req.user:", req.user);

            // Call next middleware
            next();

        } catch (tokenError) {
            console.error("Token validation error:", tokenError);
            return res.status(401).json({
                "success": false,
                "message": "Token validation failed",
                "error": tokenError.message
            })
        }

    } catch (error) {
        console.error("Middleware error:", error);
        return res.status(500).json({
            "success": false,
            "message": "Internal server error in auth middleware",
            "error": error.message
        })
    }
}

module.exports = verifyUser;