/**
 * Database seeding script for the Collaborative Task‑Manager.
 *
 * Deletes existing users, projects, and tasks, then inserts demo data for local testing.
 *
 * HOW TO RUN:
 *   1. Copy .env.example → .env and set MONGODB_URI
 *   2. node src/seed.js  # from project root
 *
 * Inserts:
 *   • 2 users (Alice and Bob)
 *   • 2 projects (one per user, with owner as member)
 *   • 8 tasks (4 per project)
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} pwd - Plain-text password.
 * @returns {Promise<string>} Hashed password.
 */
const hashPwd = (pwd) => bcrypt.hash(pwd, 10);

/**
 * Returns a Date shifted by n days from now.
 * @param {number} n - Number of days to add.
 * @returns {Date} New Date object.
 */
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

(async function seed() {
    try {
        // Connect to the database
        await connectDB();

        // Clear existing data
        await Promise.all([
            User.deleteMany(),
            Project.deleteMany(),
            Task.deleteMany()
        ]);
        console.log("Cleared existing data");

        // Create demo users
        const [aliceHash, bobHash] = await Promise.all([
            hashPwd("12345678a"),
            hashPwd("secret123")
        ]);
        const [alice, bob] = await User.create([
            { email: "yaron155@gmail.com", name: "Alice", passwordHash: aliceHash },
            { email: "bob@example.com", name: "Bob", passwordHash: bobHash }
        ]);
        console.log("Inserted users: Alice and Bob");

        // Create projects with owner as initial member
        const [projA, projB] = await Project.create([
            { name: "Alice Personal", ownerId: alice._id, memberIds: [alice._id] },
            { name: "Bob Personal", ownerId: bob._id, memberIds: [bob._id] }
        ]);
        console.log("Inserted projects for Alice and Bob");

        // Prepare tasks for each user
        const makeTasks = (owner, projectId) => [
            {
                title: "Set up dev environment",
                description: "Install Node.js & clone repo",
                projectId,
                creatorId: owner._id,
                assigneeId: owner._id,
                dueDate: daysFromNow(2),
                priority: "medium",
                labels: ["setup"]
            },
            {
                title: "Write unit tests",
                description: "Cover auth module",
                projectId,
                creatorId: owner._id,
                assigneeId: owner._id,
                dueDate: daysFromNow(5),
                priority: "high",
                labels: ["testing"]
            },
            {
                title: "Plan UI wireframes",
                description: "Draft initial wireframes",
                projectId,
                creatorId: owner._id,
                assigneeId: owner._id,
                dueDate: daysFromNow(7),
                priority: "low",
                labels: ["design"]
            },
            {
                title: "Deploy staging server",
                description: "Set up staging environment",
                projectId,
                creatorId: owner._id,
                assigneeId: owner._id,
                dueDate: daysFromNow(10),
                priority: "urgent",
                labels: ["devops"]
            }
        ];

        // Insert tasks
        const tasks = await Task.create([
            ...makeTasks(alice, projA._id),
            ...makeTasks(bob, projB._id)
        ]);
        console.log("Inserted tasks for both projects");

        // Update each project to reference its tasks
        await Promise.all(
            tasks.map(({ _id, projectId }) =>
                Project.updateOne(
                    { _id: projectId },
                    { $addToSet: { taskIds: _id } }
                )
            )
        );
        console.log("Updated taskIds for all projects");

        console.log("Seeding completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
})();
