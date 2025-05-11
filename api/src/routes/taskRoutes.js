/**
 * Task routes for managing tasks: list, retrieve, create, update, delete, and toggle completion.
 * Protected by JWT authentication middleware.
 *
 * @module routes/taskRoutes
 */
const { Router } = require("express");
const validateRequest = require("../middleware/validateRequest");
const {
    create: createTaskSchema,
    update: updateTaskSchema
} = require("../validators/taskValidator");
const { protect } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

const router = Router();

// Apply authentication to all task routes
router.use(protect);

/**
 * GET /api/tasks?projectId=&label=
 * Retrieve tasks assigned to the authenticated user, with optional filters.
 * POST /api/tasks
 * Create a new task.
 */
router.route("/")
    .get(taskController.getTasks)
    .post(
        validateRequest(createTaskSchema),
        taskController.createTask
    );

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID.
 * PATCH /api/tasks/:id
 * Update an existing task.
 * DELETE /api/tasks/:id
 * Delete a task.
 */
router.route("/:id")
    .get(taskController.getTask)
    .patch(
        validateRequest(updateTaskSchema),
        taskController.updateTask
    )
    .delete(taskController.deleteTask);

/**
 * PATCH /api/tasks/:id/toggle
 * Toggle the completion status of a task.
 */
router.patch(
    "/:id/toggle",
    taskController.toggleTaskDone
);

module.exports = router;
