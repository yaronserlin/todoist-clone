/**
 * Authentication routes: register, login, and token refresh.
 *
 * @module routes/authRoutes
 */
const { Router } = require("express");
const validateRequest = require("../middleware/validateRequest");
const {
    register: registerSchema,
    login: loginSchema,
    refresh: refreshSchema
} = require("../validators/authValidator");
const {
    register,
    login,
    refresh
} = require("../controllers/authController");

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user and receive access & refresh tokens.
 */
router.post(
    "/register",
    validateRequest(registerSchema),
    register
);

/**
 * POST /api/auth/login
 * Authenticate user credentials and issue tokens.
 */
router.post(
    "/login",
    validateRequest(loginSchema),
    login
);

/**
 * POST /api/auth/refresh
 * Refresh the access token using a valid refresh token.
 */
router.post(
    "/refresh",
    validateRequest(refreshSchema),
    refresh
);

module.exports = router;
