/**
 * Controller for project-related operations: list, get, create, update, delete, and manage members.
 *
 * @module controllers/projectController
 */
const mongoose = require("mongoose");
const Project = require("../models/Project");
const logActivity = require("../utils/logActivity");

/**
 * Retrieve all projects where the user is owner or member.
 *
 * @async
 * @param {import("express").Request} req - Express request object with authenticated user in req.user
 * @param {import("express").Response} res - Express response to send JSON data
 */
exports.getProjects = async function getProjects(req, res) {
    try {
        const userId = req.user._id;
        const projects = await Project.find({
            $or: [
                { ownerId: userId },
                { memberIds: userId }
            ]
        });
        res.json(projects);
    } catch (error) {
        console.error("getProjects error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Retrieve a single project by ID.
 *
 * @async
 * @param {import("express").Request} req - Express request with params.id
 * @param {import("express").Response} res - Express response
 */
exports.getProject = async function getProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json(project);
    } catch (error) {
        console.error("getProject error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new project.
 *
 * @async
 * @param {import("express").Request} req - Express request with body.name
 * @param {import("express").Response} res - Express response
 */
exports.createProject = async function createProject(req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Project name is required" });
        }

        const project = await Project.create({
            name,
            ownerId: req.user._id
        });

        await logActivity({ req, action: "created", project });
        res.status(201).json(project);
    } catch (error) {
        console.error("createProject error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update project name. Only the owner can update.
 *
 * @async
 * @param {import("express").Request} req - Express request with params.id and body.name
 * @param {import("express").Response} res - Express response
 */
exports.updateProject = async function updateProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.ownerId.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        project.name = req.body.name ?? project.name;
        await project.save();
        await logActivity({ req, action: "update", project });

        res.json(project);
    } catch (error) {
        console.error("updateProject error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a project. Only the owner can delete.
 *
 * @async
 * @param {import("express").Request} req - Express request with params.id
 * @param {import("express").Response} res - Express response
 */
exports.deleteProject = async function deleteProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.ownerId.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await project.deleteOne();
        await logActivity({ req, action: "delete", project });

        res.json({ message: "Project removed" });
    } catch (error) {
        console.error("deleteProject error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Add a member to the project. Only the owner can add.
 *
 * @async
 * @param {import("express").Request} req - Express request with params.id and body.userId
 * @param {import("express").Response} res - Express response
 */
exports.addMember = async function addMember(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.ownerId.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const userId = mongoose.Types.ObjectId(req.body.userId);
        if (!project.memberIds.includes(userId)) {
            project.memberIds.push(userId);
            await project.save();
        }

        await logActivity({ req, action: "update", project });
        res.json(project);
    } catch (error) {
        console.error("addMember error:", error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Remove a member from the project. Only the owner can remove.
 *
 * @async
 * @param {import("express").Request} req - Express request with params.id and params.uid
 * @param {import("express").Response} res - Express response
 */
exports.removeMember = async function removeMember(req, res) {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        if (!project.ownerId.equals(req.user._id)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        project.memberIds.pull(req.params.uid);
        await project.save();

        await logActivity({ req, action: "update", project });
        res.json(project);
    } catch (error) {
        console.error("removeMember error:", error);
        res.status(500).json({ message: error.message });
    }
};
