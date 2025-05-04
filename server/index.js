const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const session = require("express-session")
const createTables = require("./db/migrate")
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
  "https://employee-management-system-1-wj64.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
]

// CORS Configuration
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

// Session Configuration
const SESSION_SECRET = process.env.SESSION_SECRET || "587752a4f890101474dabd0d752cc1d4a0c8e620a98015c647d9707b540c542d957cc833e47d214c7a32afc5c776998add622c38195c393a0b3fdf453408d2ee"
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

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
