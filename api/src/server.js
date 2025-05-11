/**
 * Server entry point. Loads environment variables, initializes the Express app, and starts the HTTP server.
 *
 * @module server
 */

// Load environment variables from .env file into process.env
require("dotenv").config();

/**
 * Express application instance configured in src/app.js
 * @type {import("express").Express}
 */
const app = require("./app");

/**
 * Port number on which the server listens. Defaults to 5000 if not specified.
 * @constant {number}
 */
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Start the server and log the listening URL
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});