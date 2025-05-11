/**
 * Middleware for validating Express request properties (body, query, params) against Joi schemas.
 *
 * @module middleware/validateRequest
 */
const Joi = require("joi");

/**
 * Generates an Express middleware to validate a specific request property.
 *
 * @param {import("joi").Schema} schema - Joi schema to use for validation.
 * @param {"body"|"query"|"params"} [property="body"] - Request property to validate.
 * @returns {import("express").RequestHandler} Middleware function.
 */
function validateRequest(schema, property = "body") {
    return (req, res, next) => {
        // Validate the specified request property against the schema
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,    // Return all errors, not just the first
            stripUnknown: true    // Remove unknown keys from the validated data
        });

        if (error) {
            // Build error detail messages
            const details = error.details.map((detail) => detail.message);
            return res.status(400).json({
                message: "Validation failed",
                details
            });
        }

        // Replace the original data with the validated and sanitized value
        req[property] = value;
        next();
    };
}

module.exports = validateRequest;
