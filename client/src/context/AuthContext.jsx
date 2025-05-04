"use client"

import { createContext, useContext, useState, useEffect } from "react"
import authService from "../services/auth"

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  clearError: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sessionCheckTimer, setSessionCheckTimer] = useState(null)

  // Clear error function
  const clearError = () => setError(null)

  // Fetch user data from the server (on mount or refresh)
  const fetchUser = async () => {
    try {
      setError(null)
      const userData = await authService.getUser()
      if (userData && userData.user && userData.user.id && userData.user.role) {
        setUser(userData.user)
        setupSessionCheck()
      } else if (userData && userData.id && userData.role) {
        setUser(userData)
        setupSessionCheck()
      } else {
        setUser(null)
        clearSessionCheck()
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)

      // Set a user-friendly error message
      if (error.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please check your internet connection or try again later.")
      } else if (error.response && error.response.status === 401) {
        // Not authenticated - this is normal, don't show error
        setUser(null)
        clearSessionCheck()
      } else {
        setError("An error occurred while fetching user data. Please try again.")
      }

      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Setup session check timer (every 5 minutes)
  const setupSessionCheck = () => {
    clearSessionCheck() // Clear any existing timer
    const timer = setInterval(
      async () => {
        try {
          // Check if session is still valid
          const userData = await authService.checkAuth()
          if (!userData) {
            // If session is invalid, logout
            logout()
          }
        } catch (error) {
          console.error("Session check failed:", error)
          // If check fails, we might need to logout the user
          if (error.response && error.response.status === 401) {
            logout()
          }
        }
      },
      5 * 60 * 1000, // 5 minutes
    )

    setSessionCheckTimer(timer)
  }

  // Clear session check timer
  const clearSessionCheck = () => {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer)
      setSessionCheckTimer(null)
    }
  }

  // Initial user fetch on app load
  useEffect(() => {
    fetchUser()

    // Cleanup on unmount
    return () => {
      clearSessionCheck()
    }
  }, [])

  // Handle login process
  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)
      const data = await authService.login(username, password)

      const loggedInUser = data.user || data
      if (loggedInUser && loggedInUser.id && loggedInUser.role) {
        setUser(loggedInUser)
        setupSessionCheck()
      } else {
        setUser(null)
        setError("Invalid user data received from server")
      }
      return loggedInUser
    } catch (error) {
      console.error("Login failed:", error)

      // Set user-friendly error messages
      if (error.code === "ERR_NETWORK") {
        setError("Unable to connect to the server. Please check your internet connection or try again later.")
      } else if (error.response && error.response.status === 401) {
        setError("Invalid username or password")
      } else if (error.response && error.response.status === 404) {
        setError("Login service not found. Please check server configuration.")
      } else {
        setError("Login failed. Please try again.")
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  // Handle logout process
  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      await authService.logout()
      clearSessionCheck()
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if server logout fails, we still want to clear local state
    } finally {
      setUser(null)
      setLoading(false)
      window.location.href = "/login"
    }
  }

  // Refresh user info after profile/role updates
  const refreshUser = async () => {
    setLoading(true)
    await fetchUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { AuthContext }
