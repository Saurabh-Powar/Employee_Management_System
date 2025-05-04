const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const auth = require("../middleware/authMiddleware")

// Login route
router.post("/login", authController.login)

// Logout route (client-side only with JWT)
router.post("/logout", authController.logout)

// Get authenticated user's data
router.get("/user", auth.isAuthenticated, authController.getUser)

// Refresh user data
router.get("/refresh-user", auth.isAuthenticated, authController.refreshUser)

// Validate token
router.get("/validate-token", auth.isAuthenticated, authController.validateToken)

module.exports = router
