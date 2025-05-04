const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const createTables = require("./db/migrate")
const session = require("express-session")
const passport = require("passport")
require("dotenv").config()

const authRoutes = require("./routes/authRoutes")
const employeesRoutes = require("./routes/employeesRoutes")
const attendanceRoutes = require("./routes/attendanceRoutes")
const leavesRoutes = require("./routes/leavesRoutes")
const performanceRoutes = require("./routes/performanceRoutes")
const salariesRoutes = require("./routes/salariesRoutes")
const notificationsRoutes = require("./routes/notificationsRoutes")
const tasksRoutes = require("./routes/tasksRoutes")

const app = express()

// CORS Configuration - Updated for production URLs
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://employee-management-system-1-wj64.onrender.com")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  next()
})

app.use(
  cors({
    origin: "https://employee-management-system-1-1wvc.onrender.com",
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
  }),
)

// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Sessions
if (!process.env.SESSION_SECRET) {
  console.warn(
    "SESSION_SECRET is not defined in environment variables. Using a default secret (not recommended for production).",
  )
}

const pgSession = require("connect-pg-simple")(session)
const { Pool } = require("pg")

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Use proper SSL certificates in production
  },
})

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "default_secret_for_development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: true, // Always secure in production
      sameSite: "none", // Allow cross-site cookies for our frontend-backend setup
    },
  }),
)

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Root route for health check
app.get("/", (req, res) => {
  res.json({ status: "API is running", version: "1.0.0" })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeesRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/leaves", leavesRoutes)
app.use("/api/performance", performanceRoutes)
app.use("/api/salaries", salariesRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/tasks", tasksRoutes)

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  })
})

const PORT = process.env.PORT || 5000
// Port Configuration
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`

// Create tables and start the server
createTables()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on ${BACKEND_URL}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
    })
  })
  .catch((err) => {
    console.error("Could not start the server:", err)
    process.exit(1)
  })
