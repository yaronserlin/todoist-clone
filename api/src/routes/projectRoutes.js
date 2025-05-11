/**
 * Project routes for managing projects and their members.
 * Protected by JWT authentication middleware.
 *
 * @module routes/projectRoutes
 */
const { Router } = require("express");
const validateRequest = require("../middleware/validateRequest");
const {
    create: createProjectSchema,
    update: updateProjectSchema
} = require("../validators/projectValidator");
const { protect } = require("../middleware/authMiddleware");
const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember
} = require("../controllers/projectController");

const router = Router();

// All project routes require authentication
router.use(protect);

/**
 * GET /api/projects
 * Retrieve all projects where the user is owner or member.
 * POST /api/projects
 * Create a new project.
 */
router.route("/")
    .get(getProjects)
    .post(
        validateRequest(createProjectSchema),
        createProject
    );

/**
 * GET /api/projects/:id
 * Retrieve a single project by ID.
 * PATCH /api/projects/:id
 * Update project name (owner only).
 * DELETE /api/projects/:id
 * Delete a project (owner only).
 */
router.route("/:id")
    .get(getProject)
    .patch(
        validateRequest(updateProjectSchema),
        updateProject
    )
    .delete(deleteProject);

/**
 * POST /api/projects/:id/members
 * Add a member to the project (owner only).
 */
router.post(
    "/:id/members",
    addMember
);

/**
 * DELETE /api/projects/:id/members/:uid
 * Remove a member from the project (owner only).
 */
router.delete(
    "/:id/members/:uid",
    removeMember
);

module.exports = router;