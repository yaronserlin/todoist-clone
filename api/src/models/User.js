/**
 * User model definition.
 *
 * Represents a user account in the system, including authentication credentials,
 * OAuth provider info, profile data, and refresh tokens.
 *
 * @module models/User
 */
const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * Schema for storing user credentials and profile information.
 * @type {Schema}
 */
const userSchema = new Schema(
    {
        /**
         * User's unique email address (lowercased).
         */
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        /**
         * Full name of the user.
         */
        name: {
            type: String,
            required: true
        },
        /**
         * Hashed password (if registered via email/password).
         */
        passwordHash: {
            type: String
        },
        /**
         * OAuth provider identifier (e.g., 'google', 'facebook').
         */
        oauthProvider: {
            type: String
        },
        /**
         * URL to the user's avatar image.
         */
        avatarUrl: {
            type: String
        },
        /**
         * Array of issued refresh tokens for session management.
         */
        refreshTokens: [
            {
                /**
                 * The token string issued to the client.
                 */
                token: {
                    type: String,
                    required: true
                },
                /**
                 * Expiration date/time of the token.
                 */
                expiresAt: {
                    type: Date,
                    required: true
                }
            }
        ]
    },
    {
        // Automatically adds createdAt and updatedAt timestamps
        timestamps: true
    }
);

/**
 * User model based on the userSchema.
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("User", userSchema);
