const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../db/sql")

// Get JWT secret from environment or use a default for development
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_for_development"


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
        {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET
      )

      // Return user info and token
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token,
        message: "Login successful",
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Login failed due to server error", error: error.message })
    }
  },

  // Logout user - client-side only with JWT
  logout: (req, res) => {
    // With JWT, logout is handled on the client side by removing the token
    res.json({ message: "Logged out successfully" })
  },

  // Get the logged-in user's information
  getUser: (req, res) => {
    // User info is attached to req by the auth middleware
    if (req.user) {
      return res.json({ user: req.user })
    } else {
      return res.status(401).json({ message: "Not authenticated" })
    }
  },

  // Check if the user is authenticated and return user info
  checkAuth: (req, res) => {
    // User info is attached to req by the auth middleware
    if (req.user) {
      res.json({ message: "Authenticated", user: req.user })
    } else {
      res.status(401).json({ message: "Not authenticated" })
    }
  },

  // Refresh user data
  refreshUser: (req, res) => {
    if (req.user) {
      return res.json({ user: req.user })
    } else {
      return res.status(401).json({ message: "Not authenticated" })
    }
  },

  // Validate token
  validateToken: (req, res) => {
    // If middleware passed, token is valid
    return res.json({ valid: true })
  },
}

module.exports = authController
