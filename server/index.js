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

// Define allowed origins
const allowedOrigins = [
  "https://employee-management-system-1-1wvc.onrender.com",
  "https://employee-management-system-1-wj64.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
]

// CORS Configuration - Updated for production URLs with better error handling
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`
        return callback(new Error(msg), false)
      }
      return callback(null, true)
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Pre-flight requests
app.options("*", cors())

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
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "default_secret_for_development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookies in production
    },
  }),
)

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Root route for health check
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    cors: {
      allowedOrigins,
    },
  })
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

  // Handle CORS errors specifically
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: err.message,
      allowedOrigins,
    })
  }

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
      console.log(`Allowed origins: ${allowedOrigins.join(", ")}`)
    })
  })
  .catch((err) => {
    console.error("Could not start the server:", err)
    process.exit(1)
  })
