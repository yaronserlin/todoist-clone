/**
 * Server entry point. Loads environment variables, initializes the Express app, connects to MongoDB, and starts the HTTP server.
 *
 * @module server
 */

// Load environment variables from .env file into process.env
require("dotenv").config();

const connectDB = require("./config/db");

/**
 * Express application instance configured in src/app.js
 * @type {import("express").Express}
 */
const app = require("./app");

/**
 * Port number on which the server listens. Defaults to 5000 if not specified in environment.
 * @constant {number}
 */
const PORT = parseInt(process.env.PORT, 10) || 5000;

/**
 * Starts the server by first connecting to the database, then listening on defined port.
 * Exits the process if any error occurs during startup.
 *
 * @async
 * @function start
 */
async function start() {
    try {
        // Establish MongoDB connection
        await connectDB();

        // Launch HTTP server
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

// Invoke startup routine
start();