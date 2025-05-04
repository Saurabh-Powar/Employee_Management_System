const express = require("express")
const session = require("express-session")

// Session-based authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated
    req.user = req.session.user
    return next()
  }
  // User is not authenticated
  return res.status(401).json({ message: "Authentication required" })
}

const isManager = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "manager") {
    return next()
  }
  console.warn("Unauthorized manager access attempt by:", req.session?.user?.role || "unknown")
  return res.status(403).json({ message: "Access denied: Manager role required" })
}

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next()
  }
  console.warn("Unauthorized admin access attempt by:", req.session?.user?.role || "unknown")
  return res.status(403).json({ message: "Access denied: Admin role required" })
}

const isEmployee = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "employee") {
    return next()
  }
  console.warn("Unauthorized employee access attempt by:", req.session?.user?.role || "unknown")
  return res.status(403).json({ message: "Access denied: Employee role required" })
}

const isSelfOrManagerOrAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  const requestedId = Number.parseInt(req.params.employeeId || req.params.id, 10)

  if (req.session.user.role === "admin" || req.session.user.role === "manager" || req.session.user.id === requestedId) {
    return next()
  }

  console.warn(`Unauthorized access attempt: ${req.session.user.role} trying to access ID ${requestedId}`)
  return res.status(403).json({ message: "Access denied: You can only access your own data" })
}

module.exports = {
  isAuthenticated,
  isManager,
  isAdmin,
  isEmployee,
  isSelfOrManagerOrAdmin,
}
