/**
 * Task model definition.
 *
 * Represents a task within a project, including metadata, subtasks, reminders, and status.
 *
 * @module models/Task
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

/**
 * Schema for an individual subtask within a parent task.
 * @type {Schema}
 */
const subtaskSchema = new Schema(
    {
        /**
         * Title of the subtask.
         * @type {string}
         */
        title: { type: String, required: true },
        /**
         * Completion status of the subtask.
         * @type {boolean}
         */
        isDone: { type: Boolean, default: false }
    },
    {
        _id: false // disable automatic _id for subtasks
    }
);

/**
 * Schema for reminder configurations on a task.
 * @type {Schema}
 */
const reminderSchema = new Schema(
    {
        /**
         * Delivery method for the reminder (push or email).
         * @enum {string}
         */
        method: { type: String, enum: ["push", "email"], required: true },
        /**
         * Scheduled date and time for the reminder.
         * @type {Date}
         */
        time: { type: Date, required: true }
    },
    {
        _id: false // disable automatic _id for reminders
    }
);

/**
 * Schema defining a task within a project.
 * @type {Schema}
 */
const taskSchema = new Schema(
    {
        /**
         * Title of the task.
         * @type {string}
         */
        title: { type: String, required: true },
        /**
         * Detailed description of the task.
         * @type {string}
         */
        description: { type: String },
        /**
         * Reference ID of the parent project.
         * @type {ObjectId}
         */
        projectId: { type: ObjectId, ref: "Project", required: true },
        /**
         * Reference ID of the assigned user.
         * @type {ObjectId}
         */
        assigneeId: { type: ObjectId, ref: "User" },
        /**
         * Reference ID of the user who created the task.
         * @type {ObjectId}
         */
        creatorId: { type: ObjectId, ref: "User", required: true },
        /**
         * Due date for the task completion.
         * @type {Date}
         */
        dueDate: { type: Date },
        /**
         * Priority level of the task.
         * @enum {string}
         */
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "low"
        },
        /**
         * Labels associated with the task.
         * @type {string[]}
         */
        labels: [String],
        /**
         * Array of subtasks nested under this task.
         * @type {Schema[]}
         */
        subtasks: [subtaskSchema],
        /**
         * Reminder configurations for the task.
         * @type {Schema[]}
         */
        reminders: [reminderSchema],
        /**
         * Indicates whether the task is completed.
         * @type {boolean}
         */
        isCompleted: { type: Boolean, default: false }
    },
    {
        timestamps: true // adds createdAt and updatedAt
    }
);

/**
 * Task model based on the taskSchema.
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("Task", taskSchema);
