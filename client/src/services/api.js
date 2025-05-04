// Updated API service with better error handling and CORS configuration
import axios from "axios"

// Create API instance with proper configuration
const api = axios.create({
  baseURL: "https://employee-management-system-d658.onrender.com/api",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to ensure auth headers are sent
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors gracefully
    if (error.code === "ERR_NETWORK") {
      console.error("Network error - server may be down or CORS issue:", error.message)
      // You could dispatch to a global error state here
    }

    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication error:", error.response.data)
      // Only redirect if not already on login page to prevent redirect loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
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
