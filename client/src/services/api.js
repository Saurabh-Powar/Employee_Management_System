import axios from "axios"

// Define the base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://employee-management-system-gv8r.onrender.com/api"

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token or redirect to login
        localStorage.removeItem("authToken")
        window.location.href = "/login"
        return Promise.reject(error)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem("authToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Attendance-related helpers with improved error handling
export const attendanceAPI = {
  checkIn: async (employee_id) => {
    try {
      const response = await api.post("/attendance/checkin", { employeeId: employee_id })
      return response.data
    } catch (error) {
      console.error("Check-in failed:", error)
      throw error
    }
  },

  checkOut: async (employee_id) => {
    try {
      const response = await api.put("/attendance/checkout", { employeeId: employee_id })
      return response.data
    } catch (error) {
      console.error("Check-out failed:", error)
      throw error
    }
  },

  markAbsent: async (employee_id) => {
    try {
      const response = await api.post("/attendance/absent", { employeeId: employee_id })
      return response.data
    } catch (error) {
      console.error("Mark absent failed:", error)
      throw error
    }
  },

  getEmployeeAttendanceStatus: async (employee_id) => {
    try {
      const response = await api.get(`/attendance/${employee_id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to get attendance for employee ${employee_id}:`, error)
      throw error
    }
  },

  getAllAttendanceRecords: async () => {
    try {
      const response = await api.get("/attendance")
      return response.data
    } catch (error) {
      console.error("Failed to get all attendance records:", error)
      throw error
    }
  },
}

// Salary-related helpers with improved error handling
export const salaryAPI = {
  getAllSalaries: async () => {
    try {
      const response = await api.get("/salaries")
      return response.data
    } catch (error) {
      console.error("Failed to get all salaries:", error)
      throw error
    }
  },

  getEmployeeSalaries: async (employee_id) => {
    try {
      const response = await api.get(`/salaries/${employee_id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to get salaries for employee ${employee_id}:`, error)
      throw error
    }
  },

  createSalary: async (data) => {
    try {
      const response = await api.post("/salaries", data)
      return response.data
    } catch (error) {
      console.error("Failed to create salary:", error)
      throw error
    }
  },

  updateSalaryStatus: async (id, status) => {
    try {
      const response = await api.put(`/salaries/${id}`, { status })
      return response.data
    } catch (error) {
      console.error(`Failed to update salary status for ${id}:`, error)
      throw error
    }
  },
}

// Leave API utilities with improved error handling
export const leavesAPI = {
  getAllLeaves: async () => {
    try {
      const response = await api.get("/leaves")
      return response.data
    } catch (error) {
      console.error("Failed to get all leaves:", error)
      throw error
    }
  },

  getEmployeeLeaves: async (employeeId) => {
    try {
      const response = await api.get(`/leaves/${employeeId}`)
      return response.data
    } catch (error) {
      console.error(`Failed to get leaves for employee ${employeeId}:`, error)
      throw error
    }
  },

  createLeave: async (data) => {
    try {
      const response = await api.post("/leaves", data)
      return response.data
    } catch (error) {
      console.error("Failed to create leave:", error)
      throw error
    }
  },

  updateLeaveStatus: async (id, status) => {
    try {
      const response = await api.put(`/leaves/${id}`, { status })
      return response.data
    } catch (error) {
      console.error(`Failed to update leave status for ${id}:`, error)
      throw error
    }
  },
}

// Task-related helpers with improved error handling
export const tasksAPI = {
  getAllTasks: async () => {
    try {
      const response = await api.get("/tasks")
      return response.data
    } catch (error) {
      console.error("Error fetching all tasks:", error)
      throw error
    }
  },

  getEmployeeTasks: async (employeeId) => {
    try {
      const response = await api.get(`/tasks/${employeeId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching tasks for employee ${employeeId}:`, error)
      throw error
    }
  },

  createTask: async (data) => {
    try {
      const response = await api.post("/tasks", data)
      return response.data
    } catch (error) {
      console.error("Error creating task:", error)
      throw error
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await api.put(`/tasks/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating task ${id} status:`, error)
      throw error
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error)
      throw error
    }
  },

  startTaskTimer: async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/timer/start`)
      return response.data
    } catch (error) {
      console.error(`Error starting timer for task ${taskId}:`, error)
      throw error
    }
  },

  stopTaskTimer: async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/timer/stop`)
      return response.data
    } catch (error) {
      console.error(`Error stopping timer for task ${taskId}:`, error)
      throw error
    }
  },

  getTaskTimerHistory: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/timer/history`)
      return response.data
    } catch (error) {
      console.error(`Error fetching timer history for task ${taskId}:`, error)
      throw error
    }
  },
}

// Get today's attendance status with improved error handling
export const getTodayStatus = async (employeeId) => {
  try {
    const res = await api.get(`/attendance/today/${employeeId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching today's status:", error)
    throw error
  }
}

// Handling manager-specific logic for fetching attendance data
export const getAttendanceForRole = async (employeeId, role) => {
  try {
    if (role === "manager" || role === "admin") {
      const res = await api.get(`/attendance/`)
      return res.data
    } else {
      return await getTodayStatus(employeeId)
    }
  } catch (error) {
    console.error("Error fetching attendance based on role:", error)
    throw error
  }
}

export default api
