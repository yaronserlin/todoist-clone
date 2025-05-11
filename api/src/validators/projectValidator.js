/**
 * Project input validation schemas using Joi.
 *
 * Validates payloads for creating and updating projects.
 *
 * @module validators/projectValidator
 */
const Joi = require("joi");

/**
 * Schema for creating a new project.
 * @type {import("joi").ObjectSchema}
 */
const createProjectSchema = Joi.object({
    /**
     * Project name, must be between 1 and 100 characters.
     */
    name: Joi.string().min(1).max(100).required()
});

/**
 * Schema for updating an existing project.
 * @type {import("joi").ObjectSchema}
 */
const updateProjectSchema = Joi.object({
    /**
     * New project name, optional, must be between 1 and 100 characters if provided.
     */
    name: Joi.string().min(1).max(100)
});

// Export validation schemas
module.exports = {
    create: createProjectSchema,
    update: updateProjectSchema
};