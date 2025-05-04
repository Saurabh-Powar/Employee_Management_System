// Simplify authentication controller to use JWT instead of sessions
const bcrypt = require("bcrypt")
const db = require("../db/sql")
const jwt = require("jsonwebtoken")

const authController = {
  // Login user
  login: async (req, res) => {
    const { username, password } = req.body
    try {
      // Query the database to get the user details
      const userResult = await db.query("SELECT * FROM users WHERE username = $1", [username])
      const user = userResult.rows[0]

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials: User not found" })
      }

      // Compare password with hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials: Incorrect password" })
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" },
      )

      // Store user info in the session as well for backward compatibility
      req.session.user = { id: user.id, username: user.username, role: user.role }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        token: token,
        message: "Login successful",
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Login failed due to server error", error: error.message })
    }
  },

  // Logout user
  logout: (req, res) => {
    // Destroy the session to log out
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err)
        return res.status(500).json({ message: "Logout failed due to server error", error: err.message })
      }
      res.json({ message: "Logged out successfully" })
    })
  },

  // Get the logged-in user's information
  getUser: (req, res) => {
    // Check if the user is authenticated (session-based check)
    if (req.session.user) {
      return res.json({ user: req.session.user })
    } else if (req.user) {
      // JWT authentication
      return res.json({ user: req.user })
    } else {
      return res.status(401).json({ message: "Not authenticated: User session not found" })
    }
  },

  // Check if the user is authenticated and return user info
  checkAuth: (req, res) => {
    // This is an endpoint to verify if the user is authenticated
    if (req.session.user) {
      res.json({ message: "Authenticated", user: req.session.user })
    } else if (req.user) {
      // JWT authentication
      res.json({ message: "Authenticated", user: req.user })
    } else {
      res.status(401).json({ message: "Not authenticated: User session not found" })
    }
  },

  refreshUser: (req, res) => {
    if (req.session.user) {
      return res.json({ user: req.session.user })
    } else if (req.user) {
      // JWT authentication
      return res.json({ user: req.user })
    } else {
      return res.status(401).json({ message: "Not authenticated: User session not found" })
    }
  },

  // Validate token endpoint
  validateToken: (req, res) => {
    // If middleware allowed this request, token is valid
    return res.json({ valid: true })
  },
}
module.exports = authController
