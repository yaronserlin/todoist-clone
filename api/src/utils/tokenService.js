/**
 * Token service utilities for generating and signing access and refresh tokens.
 *
 * @module utils/tokenService
 */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Time-to-live for access tokens.
 * @constant {string}
 */
const ACCESS_TTL = "15m";

/**
 * Number of days a refresh token remains valid.
 * @constant {number}
 */
const REFRESH_DAYS = 30;

/**
 * Creates a signed JSON Web Token (JWT) access token for a user.
 *
 * @param {Object} user - User data used as JWT payload.
 * @param {import("mongoose").Types.ObjectId} user._id - Unique identifier of the user.
 * @param {string} user.name - Full name of the user.
 * @param {string} user.email - Email address of the user.
 * @returns {string} Signed JWT access token.
 * @throws {Error} If JWT_SECRET is not defined in environment.
 */
function signAccess(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    return jwt.sign(
        { id: user._id, name: user.name, email: user.email }, // payload
        process.env.JWT_SECRET,                               // secret key
        { expiresIn: ACCESS_TTL }                             // token options
    );
}

/**
 * Generates a cryptographically secure random refresh token.
 *
 * @returns {string} A hex-encoded string of length 80.
 */
function generateRefresh() {
    // 40 bytes => 80 hex characters
    return crypto.randomBytes(40).toString("hex");
}

/**
 * Calculates the expiration date for a refresh token based on REFRESH_DAYS.
 *
 * @returns {Date} Date object representing the token expiry datetime.
 */
function refreshExpiryDate() {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return new Date(Date.now() + REFRESH_DAYS * millisecondsPerDay);
}

// Export the token service functions
module.exports = {
    signAccess,
    generateRefresh,
    refreshExpiryDate
};
