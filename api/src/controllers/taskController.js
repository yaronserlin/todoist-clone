/**
 * Controller for task-related operations: list, retrieve, create, update, delete, and toggle completion status.
 *
 * @module controllers/taskController
 */
const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const logActivity = require("../utils/logActivity");

/**
 * Retrieve tasks assigned to the authenticated user, optionally filtered by project or label.
 *
 * @async
 * @param {import("express").Request} req - Request object containing authenticated user and query params.
 * @param {import("express").Response} res - Response object used to send JSON data.
 */
exports.getTasks = async function getTasks(req, res) {
    try {
        const userId = req.user._id;
        const filter = { assigneeId: userId };

        if (req.query.projectId) filter.projectId = req.query.projectId;
        if (req.query.label) filter.labels = req.query.label;

        const tasks = await Task.find(filter);
        res.json(tasks);
    } catch (error) {
        console.error("getTasks error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve a single task by its ID.
 *
 * @async
 * @param {import("express").Request} req - Request object with param id.
 * @param {import("express").Response} res - Response object.
 */
exports.getTask = async function getTask(req, res) {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (error) {
        console.error("getTask error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new task and associate it with the project.
 *
 * @async
 * @param {import("express").Request} req - Request with task data in body.
 * @param {import("express").Response} res - Response used to send JSON data.
 */
exports.createTask = async function createTask(req, res) {
    try {
        const { title, projectId } = req.body;
        if (!title || !projectId) {
            return res.status(400).json({ message: "Title and projectId are required" });
        }

        const task = await Task.create({
            ...req.body,
            creatorId: req.user._id,
            assigneeId: req.body.assigneeId || req.user._id
        });

        // Add task reference to project's taskIds array
        await Project.updateOne(
            { _id: projectId },
            { $addToSet: { taskIds: task._id } }
        );

        await logActivity({ req, action: "created", task });
        res.status(201).json(task);
    } catch (error) {
        console.error("createTask error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update an existing task. Only the creator or assignee may update.
 * If projectId changes, updates task references in old and new projects.
 *
 * @async
 * @param {import("express").Request} req - Request with param id and update data in body.
 * @param {import("express").Response} res - Response object.
 */
exports.updateTask = async function updateTask(req, res) {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const userId = req.user._id.toString();
        const creatorId = task.creatorId.toString();
        const assigneeId = task.assigneeId?.toString();
        const allowed = [creatorId, assigneeId].includes(userId);
        if (!allowed) {
            return res.status(403).json({ message: "Forbidden" });
        }

        // Track project change for updating references
        const oldProjectId = task.projectId.toString();
        Object.assign(task, req.body);
        await task.save();

        const newProjectId = task.projectId.toString();
        if (newProjectId !== oldProjectId) {
            await Project.updateOne(
                { _id: newProjectId },
                { $addToSet: { taskIds: task._id } }
            );
            await Project.updateOne(
                { _id: oldProjectId },
                { $pull: { taskIds: task._id } }
            );
        }

        await logActivity({ req, action: "update", task });
        res.json(task);
    } catch (error) {
        console.error("updateTask error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a task. Only the creator or assignee may delete.
 * Removes task reference from the project.
 *
 * @async
 * @param {import("express").Request} req - Request with param id.
 * @param {import("express").Response} res - Response object.
 */
exports.deleteTask = async function deleteTask(req, res) {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const userId = req.user._id.toString();
        const creatorId = task.creatorId.toString();
        const assigneeId = task.assigneeId?.toString();
        const allowed = [creatorId, assigneeId].includes(userId);
        if (!allowed) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await task.deleteOne();

        await Project.updateOne(
            { _id: task.projectId },
            { $pull: { taskIds: task._id } }
        );

        await logActivity({ req, action: "delete", task });
        res.json({ message: "Task removed" });
    } catch (error) {
        console.error("deleteTask error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Toggle a task's completion status. Only the creator or assignee may toggle.
 * Logs 'completed' action on completion, 'update' otherwise.
 *
 * @async
 * @param {import("express").Request} req - Request with param id.
 * @param {import("express").Response} res - Response object.
 */
exports.toggleTaskDone = async function toggleTaskDone(req, res) {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        const userId = req.user._id.toString();
        const creatorId = task.creatorId.toString();
        const assigneeId = task.assigneeId?.toString();
        const allowed = [creatorId, assigneeId].includes(userId);
        if (!allowed) {
            return res.status(403).json({ message: "Forbidden" });
        }

        task.isCompleted = !task.isCompleted;
        await task.save();

        const actionType = task.isCompleted ? "completed" : "update";
        await logActivity({ req, action: actionType, task });
        res.json(task);
    } catch (error) {
        console.error("toggleTaskDone error:", error);
        res.status(500).json({ message: error.message });
    }
};
