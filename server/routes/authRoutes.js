const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { isAuthenticated } = require("../middleware/authMiddleware")

// Login route
router.post("/login", authController.login)

// Logout route
router.post("/logout", authController.logout)

// Get authenticated user's data
router.get("/user", isAuthenticated, authController.getUser)

// Refresh user data
router.get("/refresh-user", isAuthenticated, authController.refreshUser)

// Check authentication status
router.get("/check-auth", isAuthenticated, authController.checkAuth)

module.exports = router
