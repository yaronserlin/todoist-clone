/**
 * Task input validation schemas using Joi.
 *
 * Validates payloads for creating and updating tasks.
 *
 * @module validators/taskValidator
 */
const Joi = require("joi");

/**
 * Allowed priority levels for tasks.
 * @constant {string[]}
 */
const priorities = ["low", "medium", "high", "urgent"];

/**
 * Schema for creating a new task.
 * @type {import("joi").ObjectSchema}
 */
const createTaskSchema = Joi.object({
    /**
     * Title of the task (required).
     */
    title: Joi.string().min(1).required(),
    /**
     * ID of the project the task belongs to (24-character hex string).
     */
    projectId: Joi.string().hex().length(24).required(),
    /**
     * ID of the user assigned to the task (24-character hex string, optional).
     */
    assigneeId: Joi.string().hex().length(24),
    /**
     * Detailed description, can be empty string.
     */
    description: Joi.string().allow(""),
    /**
     * Due date in ISO 8601 format (optional).
     */
    dueDate: Joi.date().iso(),
    /**
     * Priority level, defaults to 'low'.
     */
    priority: Joi.string().valid(...priorities).default("low"),
    /**
     * Array of label strings.
     */
    labels: Joi.array().items(Joi.string()),
    /**
     * Array of subtasks with title and completion status.
     */
    subtasks: Joi.array().items(
        Joi.object({
            title: Joi.string().required(),
            isDone: Joi.boolean()
        })
    )
});

/**
 * Schema for updating an existing task. Makes title and projectId optional.
 * @type {import("joi").ObjectSchema}
 */
const updateTaskSchema = createTaskSchema.fork(
    ["title", "projectId"],
    (schema) => schema.optional()
);

// Export validation schemas
module.exports = {
    create: createTaskSchema,
    update: updateTaskSchema
};
