/**
 * Project model definition.
 *
 * Represents a project with a name, owner reference, member references, and related task references.
 *
 * @module models/Project
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

/**
 * Schema for storing project information.
 * @type {Schema}
 */
const projectSchema = new Schema(
    {
        /**
         * Human-readable name of the project.
         * @type {string}
         */
        name: {
            type: String,
            required: true
        },
        /**
         * Reference to the user who owns/is creator of the project.
         * @type {ObjectId}
         */
        ownerId: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        /**
         * References to users who are members/collaborators on the project.
         * @type {ObjectId[]}
         */
        memberIds: [
            {
                type: ObjectId,
                ref: "User"
            }
        ],
        /**
         * References to tasks associated with this project.
         * @type {ObjectId[]}
         */
        taskIds: [
            {
                type: ObjectId,
                ref: "Task"
            }
        ]
    },
    {
        timestamps: true // adds createdAt and updatedAt fields
    }
);

/**
 * Project model based on projectSchema.
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("Project", projectSchema);
