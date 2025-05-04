"use client"

import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Login from "./pages/login"
import AdminPage from "./pages/AdminPage"
import ManagerPage from "./pages/ManagerPage"
import EmployeePage from "./pages/EmployeePage"
import NetworkStatusIndicator from "./components/NetworkStatusIndicator"
import "./AppS.css"

function App() {
  const { user, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Router>
      <NetworkStatusIndicator />
      {error && <div className="global-error-message">{error}</div>}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.role === "admin" ? (
              <AdminPage />
            ) : user.role === "manager" ? (
              <ManagerPage />
            ) : (
              <EmployeePage />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
