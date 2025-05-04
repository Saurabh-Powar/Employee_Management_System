// Update auth middleware to support both session and JWT authentication
const jwt = require("jsonwebtoken")

const authMiddleware = {
  // Check if user is authenticated
  isAuthenticated: (req, res, next) => {
    // First check session authentication
    if (req.session && req.session.user) {
      return next()
    }

    // Then check JWT authentication
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
        req.user = decoded
        return next()
      } catch (error) {
        console.error("JWT verification failed:", error)
      }
    }

    // If no authentication method succeeded
    return res.status(401).json({ message: "Unauthorized: Authentication required" })
  },

  // Check if user has admin role
  isAdmin: (req, res, next) => {
    const user = req.session.user || req.user
    if (user && user.role === "admin") {
      return next()
    }
    return res.status(403).json({ message: "Forbidden: Admin access required" })
  },

  // Check if user has manager role or higher
  isManager: (req, res, next) => {
    const user = req.session.user || req.user
    if (user && (user.role === "manager" || user.role === "admin")) {
      return next()
    }
    return res.status(403).json({ message: "Forbidden: Manager access required" })
  },

  // Check if user is accessing their own data or has higher privileges
  isSelfOrHigher: (req, res, next) => {
    const user = req.session.user || req.user
    const requestedUserId = Number.parseInt(req.params.id)

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: Authentication required" })
    }

    if (user.id === requestedUserId || user.role === "admin" || user.role === "manager") {
      return next()
    }

    return res.status(403).json({ message: "Forbidden: You can only access your own data" })
  },
}

module.exports = authMiddleware
