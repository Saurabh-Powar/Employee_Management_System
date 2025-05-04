const jwt = require("jsonwebtoken")

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_for_development"

// Verify JWT token from Authorization header
const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN format

  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Attach user info to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error("Token verification failed:", error)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

const isAuthenticated = (req, res, next) => {
  verifyToken(req, res, next)
}

const isManager = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (req.user && req.user.role === "manager") {
      return next()
    }

    console.warn("Unauthorized manager access attempt by:", req.user?.role || "unknown")
    return res.status(403).json({ message: "Access denied: Manager role required" })
  })
}

const isAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (req.user && req.user.role === "admin") {
      return next()
    }

    console.warn("Unauthorized admin access attempt by:", req.user?.role || "unknown")
    return res.status(403).json({ message: "Access denied: Admin role required" })
  })
}

const isEmployee = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    if (req.user && req.user.role === "employee") {
      return next()
    }

    console.warn("Unauthorized employee access attempt by:", req.user?.role || "unknown")
    return res.status(403).json({ message: "Access denied: Employee role required" })
  })
}

const isSelfOrManagerOrAdmin = (req, res, next) => {
  verifyToken(req, res, (err) => {
    if (err) return next(err)

    const requestedId = Number.parseInt(req.params.employeeId || req.params.id, 10)

    if (req.user.role === "admin" || req.user.role === "manager" || req.user.id === requestedId) {
      return next()
    }

    console.warn(`Unauthorized access attempt: ${req.user.role} trying to access ID ${requestedId}`)
    return res.status(403).json({ message: "Access denied: You can only access your own data" })
  })
}

module.exports = {
  isAuthenticated,
  isManager,
  isAdmin,
  isEmployee,
  isSelfOrManagerOrAdmin,
}
