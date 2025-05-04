import api from "./api"

const authService = {
  // Login service
  async login(username, password) {
    try {
      const response = await api.post("/auth/login", { username, password })

      // Store the JWT token in localStorage
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token)
      }

      return response.data
    } catch (error) {
      console.error("Login failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Logout service
  async logout() {
    try {
      // With JWT, we just need to remove the token from localStorage
      localStorage.removeItem("authToken")

      // Optional: notify the server about logout
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout failed:", error?.response?.data || error.message || error)
      // Even if the server logout fails, we still want to clear local state
      localStorage.removeItem("authToken")
    }
  },

  // Fetch logged-in user details with retry logic
  async getUser(retryCount = 0) {
    try {
      // Check if we have a token first
      const token = localStorage.getItem("authToken")
      if (!token) {
        return null
      }

      const response = await api.get("/auth/user")
      return response.data
    } catch (error) {
      // If it's a network error and we haven't retried too many times, try again
      if (error.code === "ERR_NETWORK" && retryCount < 2) {
        console.log(`Network error, retrying (${retryCount + 1}/2)...`)
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.getUser(retryCount + 1)
      }

      if (error.response && error.response.status === 401) {
        console.log("User not authenticated")
        localStorage.removeItem("authToken")
        return null
      }

      console.error("Fetching user failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Refresh user session data
  async refreshUser() {
    try {
      const response = await api.get("/auth/refresh-user")
      return response.data
    } catch (error) {
      console.error("Refreshing user data failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Register a new user (if needed)
  async register(userData) {
    try {
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      console.error("Registration failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(userId, profileData) {
    try {
      const response = await api.put(`/auth/profile/${userId}`, profileData)
      return response.data
    } catch (error) {
      console.error("Profile update failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Check if token is valid
  async validateToken() {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return false
      }

      const response = await api.get("/auth/validate-token")
      return response.data.valid
    } catch (error) {
      console.error("Token validation failed:", error?.response?.data || error.message || error)
      return false
    }
  },
}

export default authService
