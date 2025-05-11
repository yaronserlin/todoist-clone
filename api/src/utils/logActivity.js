/**
 * Logs user actions on tasks or projects to the ActivityLog collection.
 *
 * @module utils/logActivity
 */
const ActivityLog = require("../models/ActivityLog");

/**
 * Create a log entry for a user action.
 *
 * @async
 * @function logActivity
 * @param {Object} params - Parameters for logging activity.
 * @param {import("express").Request} params.req - Express request object containing authenticated user.
 * @param {string} params.action - Action performed (e.g., 'created', 'update', 'completed', 'delete').
 * @param {import("mongoose").Document} [params.task] - Optional Task document reference.
 * @param {import("mongoose").Document} [params.project] - Optional Project document reference.
 * @param {Object} [params.meta={}] - Additional metadata to include in the log entry.
 * @returns {Promise<void>} Resolves when the log entry is created or logs an error.
 */
async function logActivity({ req, action, task = null, project = null, meta = {} }) {
    try {
        // Determine project reference: use provided project or infer from task
        const projectId = project?._id ?? task?.projectId;

        await ActivityLog.create({
            taskId: task?._id,
            projectId,
            userId: req.user._id,
            action,
            metadata: meta
        });
    } catch (error) {
        // Log error without interrupting main flow
        console.error("logActivity error:", error.message);
    }
}

module.exports = logActivity;
