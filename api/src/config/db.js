const mongoose = require("mongoose");

/**
 * Initializes and validates the MongoDB connection using Mongoose.
 *
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when the database connection is successful.
 * @throws {Error} If MONGODB_URI is undefined or the connection fails.
 */
async function connectDB() {
    // Retrieve MongoDB connection string from environment variables
    const { MONGODB_URI: uri } = process.env;
    if (!uri) {
        console.error("MONGODB_URI is not defined in environment variables.");
        process.exit(1);
    }

    try {
        // Attempt to connect with recommended options
        await mongoose.connect(uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });

        // Log success only in non-test environments
        if (process.env.NODE_ENV !== "test") {
            console.log(`MongoDB connected to ${uri}`);
        }
    } catch (error) {
        // Print error details and terminate
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}

module.exports = connectDB;
