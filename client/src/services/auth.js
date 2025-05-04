import api from "./api"

const authService = {
  // Login service
  async login(username, password) {
    try {
      const response = await api.post("/auth/login", { username, password })
      return response.data
    } catch (error) {
      console.error("Login failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Logout service
  async logout() {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout failed:", error?.response?.data || error.message || error)
      // Even if the server logout fails, we still want to redirect to login
      window.location.href = "/login"
    }
  },

  // Fetch logged-in user details with retry logic
  async getUser(retryCount = 0) {
    try {
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

  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await api.get("/auth/check-auth")
      return response.data.user
    } catch (error) {
      console.error("Auth check failed:", error?.response?.data || error.message || error)
      return null
    }
  },
}

export default authService
