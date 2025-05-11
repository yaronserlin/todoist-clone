/**
 * Main application entry point. Configures and exports the Express app.
 *
 * @module app
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

/**
 * Create and configure the Express application.
 * @type {import("express").Express}
 */
const app = express();

// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// HTTP request logging: only enabled in development mode for performance
// if (process.env.NODE_ENV === "development") {
app.use(morgan("dev"));
// }

/**
 * Mount authentication routes at /api/auth
 */
app.use("/api/auth", authRoutes);

/**
 * Mount project management routes at /api/projects
 */
app.use("/api/projects", projectRoutes);

/**
 * Mount task management routes at /api/tasks
 */
app.use("/api/tasks", taskRoutes);

// Export the configured Express app for server startup
module.exports = app;
