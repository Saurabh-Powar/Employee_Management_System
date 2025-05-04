// Updated API service to connect to production backend
import axios from "axios"

// Use the production backend URL
const api = axios.create({
  baseURL: "https://employee-management-system-gv8r.onrender.com/api",
  withCredentials: true,
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
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication error:", error.response.data)
      // Redirect to login page on authentication errors
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Attendance-related helpers
export const attendanceAPI = {
  checkIn: (employee_id) => api.post("/attendance/checkin", { employeeId: employee_id }),

  checkOut: (employee_id) => api.put("/attendance/checkout", { employeeId: employee_id }),

  markAbsent: (employee_id) => api.post("/attendance/absent", { employeeId: employee_id }),

  getEmployeeAttendanceStatus: (employee_id) => api.get(`/attendance/${employee_id}`),

  getAllAttendanceRecords: () => api.get("/attendance"),
}

// Salary-related helpers
export const salaryAPI = {
  getAllSalaries: () => api.get("/salaries"),
  getEmployeeSalaries: (employee_id) => api.get(`/salaries/${employee_id}`),
  createSalary: (data) => api.post("/salaries", data),
  updateSalaryStatus: (id, status) => api.put(`/salaries/${id}`, { status }),
}

// Leave API utilities
export const leavesAPI = {
  getAllLeaves: () => api.get("/leaves"),
  getEmployeeLeaves: (employeeId) => api.get(`/leaves/${employeeId}`),
  createLeave: (data) => api.post("/leaves", data),
  updateLeaveStatus: (id, status) => api.put(`/leaves/${id}`, { status }),
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
