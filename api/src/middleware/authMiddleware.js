

/**
 * Middleware to verify JWT access tokens and protect secured routes.
 * Attaches the authenticated user to req.user if the token is valid.
 *
 * @module middleware/authMiddleware
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes by requiring a valid Bearer token in the Authorization header.
 *
 * @async
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Next middleware function
 */
export const protect = async (req, res, next) => {
    // Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token is missing" });
    }

    try {
        // Extract token from header
        const token = authHeader.split(" ")[1];
        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user by ID from decoded token, excluding passwordHash
        const user = await User.findById(decoded.id).select("-passwordHash");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("protect middleware error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

// module.exports = protect;
