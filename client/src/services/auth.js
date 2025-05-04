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
      // Even if the server logout fails, we still want to clear local state
      // so we don't throw the error here
    }
  },

  // Fetch logged-in user details
  async getUser() {
    try {
      const response = await api.get("/auth/user")
      return response.data
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log("User not authenticated")
        return null
      }
      console.error("Fetching user failed:", error?.response?.data || error.message || error)
      throw error
    }
  },

  // Refresh user session data (role-aware)
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
      const response = await api.get("/auth/validate-token")
      return response.data.valid
    } catch (error) {
      console.error("Token validation failed:", error?.response?.data || error.message || error)
      return false
    }
  },
}

export default authService
