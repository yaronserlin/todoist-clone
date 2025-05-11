/**
 * Authentication input validation schemas using Joi.
 *
 * Validates user registration, login, and token refresh payloads.
 *
 * @module validators/authValidator
 */
const Joi = require("joi");

/**
 * Schema for user registration input.
 * @type {import("joi").ObjectSchema}
 */
const registerSchema = Joi.object({
    // User's email address (must be unique and properly formatted)
    email: Joi.string().email().required(),
    // Full name with length constraints
    name: Joi.string().min(2).max(50).required(),
    // Password with minimum length requirement
    password: Joi.string().min(6).required()
});

/**
 * Schema for user login input.
 * @type {import("joi").ObjectSchema}
 */
const loginSchema = Joi.object({
    // Registered email address
    email: Joi.string().email().required(),
    // Corresponding account password
    password: Joi.string().required()
});

/**
 * Schema for refreshing access tokens.
 * @type {import("joi").ObjectSchema}
 */
const refreshSchema = Joi.object({
    // Refresh token issued previously
    refreshToken: Joi.string().required()
});

// Export validation schemas
module.exports = {
    register: registerSchema,
    login: loginSchema,
    refresh: refreshSchema
};
