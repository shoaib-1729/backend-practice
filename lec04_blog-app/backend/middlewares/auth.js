const { validToken } = require("../utils/generateToken");
const logger = require("../utils/logger");

async function verifyUser(req, res, next) {
    try {
        // Check if authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing",
            });
        }

        // Extract token from headers
        const authHeader = req.headers.authorization;

        // Check if header has Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid token format. Use Bearer <token>",
            });
        }

        const token = authHeader.split(" ")[1];

        // Check if token exists after split
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not provided",
            });
        }

        try {
            const userData = validToken(token);

            // Check userData
            if (!userData) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token",
                });
            }

            // Check if userData has required properties
            if (!userData.id) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token payload - missing user ID",
                });
            }

            // Set user data to request
            req.user = userData.id;

            // Call next middleware
            next();
        } catch (tokenError) {
            logger.error("Token validation error:", tokenError);
            return res.status(401).json({
                success: false,
                message: "Token validation failed",
                error: tokenError.message,
            });
        }
    } catch (error) {
        logger.error("Middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error in auth middleware",
            error: error.message,
        });
    }
}

module.exports = verifyUser;