/**
 * ActivityLog model definition.
 *
 * Records user actions on tasks and projects, along with optional metadata.
 *
 * @module models/ActivityLog
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

/**
 * Schema for logging user activity related to tasks and projects.
 * @type {Schema}
 */
const logSchema = new Schema(
    {
        /**
         * Reference to the task on which the action occurred.
         * @type {ObjectId}
         */
        taskId: {
            type: ObjectId,
            ref: "Task"
        },
        /**
         * Reference to the project on which the action occurred.
         * @type {ObjectId}
         */
        projectId: {
            type: ObjectId,
            ref: "Project"
        },
        /**
         * Reference to the user who performed the action.
         * @type {ObjectId}
         */
        userId: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        /**
         * Type of action performed.
         * @enum {string}
         */
        action: {
            type: String,
            enum: ["created", "update", "completed", "delete"],
            required: true
        },
        /**
         * Additional data related to the action.
         * @type {Object}
         */
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        /**
         * Only track creation time under 'timestamp'; disable updates.
         */
        timestamps: { createdAt: "timestamp", updatedAt: false }
    }
);

/**
 * ActivityLog model based on logSchema.
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("ActivityLog", logSchema);
