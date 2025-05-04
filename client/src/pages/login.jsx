"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Loginstyle.css"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("checking")
  const navigate = useNavigate()
  const { login, error: authError, clearError } = useAuth()

  // Check server connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Simple fetch to the backend to check if server is reachable
        const response = await fetch("https://employee-management-system-gv8r.onrender.com", {
          method: "HEAD",
          mode: "cors",
        })

        if (response.ok) {
          setConnectionStatus("connected")
        } else {
          setConnectionStatus("error")
          setError("Server is reachable but returned an error.")
        }
      } catch (err) {
        console.error("Connection check failed:", err)
        setConnectionStatus("error")
        setError("Cannot connect to server. Please check if the server is running.")
      }
    }

    checkConnection()
  }, [])

  // Use auth context error if available
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    clearError && clearError()

    try {
      const response = await login(username, password)
      const user = response?.user || response

      if (user?.role) {
        navigate("/")
      } else {
        setError("Invalid login. Please check your credentials.")
      }
    } catch (err) {
      console.error("Login failed:", err)

      // Provide more specific error messages based on the error
      if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check your internet connection or if the server is running.")
      } else if (err.response) {
        // Handle different HTTP error codes
        switch (err.response.status) {
          case 401:
            setError("Invalid username or password.")
            break
          case 404:
            setError("Login service not found. Please check server configuration.")
            break
          case 500:
            setError("Server error. Please try again later.")
            break
          default:
            setError(err.response?.data?.message || "Login failed. Please try again.")
        }
      } else {
        setError("Login failed. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

        {connectionStatus === "error" && (
          <div className="connection-error">
            <p>⚠️ {error || "Server connection error"}</p>
            <p className="connection-help">
              The application cannot connect to the backend server. Please try again later or contact support.
            </p>
          </div>
        )}

        {error && connectionStatus !== "error" && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label className="input-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
            autoComplete="username"
            disabled={loading || connectionStatus === "error"}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            autoComplete="current-password"
            disabled={loading || connectionStatus === "error"}
          />
        </div>

        <button type="submit" className="submit-button" disabled={loading || connectionStatus === "error"}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {connectionStatus === "checking" && <p className="connection-status">Checking server connection...</p>}
      </form>
    </div>
  )
}

export default Login

