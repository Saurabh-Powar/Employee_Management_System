const bcrypt = require("bcrypt")
const db = require("../db/sql")

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

      // Create session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      }

      // Return user info
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        message: "Login successful",
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Login failed due to server error", error: error.message })
    }
  },

  // Logout user
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out, please try again" })
      }
      res.clearCookie("connect.sid") // Clear the session cookie
      res.json({ message: "Logged out successfully" })
    })
  },

  // Get the logged-in user's information
  getUser: (req, res) => {
    if (req.session && req.session.user) {
      return res.json({ user: req.session.user })
    } else {
      return res.status(401).json({ message: "Not authenticated" })
    }
  },

  // Check if the user is authenticated and return user info
  checkAuth: (req, res) => {
    if (req.session && req.session.user) {
      res.json({ message: "Authenticated", user: req.session.user })
    } else {
      res.status(401).json({ message: "Not authenticated" })
    }
  },

  // Refresh user data
  refreshUser: (req, res) => {
    if (req.session && req.session.user) {
      return res.json({ user: req.session.user })
    } else {
      return res.status(401).json({ message: "Not authenticated" })
    }
  },
}

module.exports = authController
