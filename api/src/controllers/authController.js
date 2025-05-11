/**
 * Controller for user authentication actions: register, login, and token refresh.
 *
 * @module controllers/authController
 */
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
    signAccess,
    generateRefresh,
    refreshExpiryDate
} = require("../utils/tokenService");

/**
 * Registers a new user with email, name, and password.
 * Hashes the password, issues initial refresh token, and returns access and refresh tokens.
 *
 * @async
 * @param {import("express").Request} req - Express request with body: { email, name, password }
 * @param {import("express").Response} res - Express response used to send JSON payload.
 * @returns {Promise<void>}
 */
exports.register = async function register(req, res) {
    try {
        const { email, name, password } = req.body;

        // Prevent duplicate registrations
        if (await User.findOne({ email })) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Securely hash the user password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate initial refresh token entry
        const refreshEntry = {
            token: generateRefresh(),
            expiresAt: refreshExpiryDate()
        };

        // Create user document with hashed password and refresh token
        const user = await User.create({
            email,
            name,
            passwordHash,
            refreshTokens: [refreshEntry]
        });

        // Respond with JWT access and refresh tokens plus user info
        res.status(201).json({
            accessToken: signAccess(user),
            refreshToken: refreshEntry.token,
            user
        });
    } catch (error) {
        console.error("register error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Authenticates a user via email and password.
 * On success, issues new access and refresh tokens and persists the refresh token.
 *
 * @async
 * @param {import("express").Request} req - Express request with body: { email, password }
 * @param {import("express").Response} res - Express response used to send JSON payload.
 * @returns {Promise<void>}
 */
exports.login = async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Lookup user by email
        const user = await User.findOne({ email });
        const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create and store new refresh token
        const refreshEntry = {
            token: generateRefresh(),
            expiresAt: refreshExpiryDate()
        };
        user.refreshTokens.push(refreshEntry);
        await user.save();

        // Respond with new tokens
        res.json({
            accessToken: signAccess(user),
            refreshToken: refreshEntry.token,
            user
        });
    } catch (error) {
        console.error("login error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Refreshes JWT access tokens using a valid refresh token.
 * Rotates the refresh token by removing the old one and issuing a new one.
 *
 * @async
 * @param {import("express").Request} req - Express request with body: { refreshToken }
 * @param {import("express").Response} res - Express response used to send JSON payload.
 * @returns {Promise<void>}
 */
exports.refresh = async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Missing refreshToken" });
        }

        // Find user with valid, non-expired refresh token
        const user = await User.findOne({
            "refreshTokens.token": refreshToken,
            "refreshTokens.expiresAt": { $gt: new Date() }
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Rotate refresh tokens: remove old, add new
        user.refreshTokens = user.refreshTokens.filter(
            (entry) => entry.token !== refreshToken
        );
        const newRefreshEntry = {
            token: generateRefresh(),
            expiresAt: refreshExpiryDate()
        };
        user.refreshTokens.push(newRefreshEntry);
        await user.save();

        // Issue new access and refresh tokens
        res.json({
            accessToken: signAccess(user),
            refreshToken: newRefreshEntry.token
        });
    } catch (error) {
        console.error("refresh error:", error);
        res.status(500).json({ message: error.message });
    }
};
