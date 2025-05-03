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

// ✅ 1. CORS (allow frontend + send credentials)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://employee-management-system-1-1wvc.onrender.com",
    credentials: true,
  }),
)

// ✅ 2. bodyParser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// ✅ 3. Sessions
const pgSession = require('connect-pg-simple')(session); // Import connect-pg-simple
const { Pool } = require('pg'); // Import pg for PostgreSQL connection

// Set up the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL, // Use PostgreSQL connection string from environment variables
  ssl: {
    rejectUnauthorized: false // Enable SSL for Render's managed PostgreSQL
  }
});

app.use(session({
  store: new pgSession({
    pool: pool, // Use the PostgreSQL connection pool
    tableName: 'sessions', // Name of the session table (default is "session")
  }),
  secret: process.env.SESSION_SECRET, // Replace with a secure secret
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something is stored
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // Session expiration (14 days in milliseconds)
  }
}));

// ✅ 4. Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/employees", employeesRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/leaves", leavesRoutes)
app.use("/api/performance", performanceRoutes)
app.use("/api/salaries", salariesRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use("/api/tasks", tasksRoutes)

const PORT = 5000
// Create tables and start the server
createTables()
  .then(() => {
      app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  })
  })
  .catch((err) => {
    console.error("Could not start the server:", err)
    process.exit(1) // Exit with error code
  })
