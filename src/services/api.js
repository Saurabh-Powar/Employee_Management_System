// src/services/api.js

import axios from "axios";
import axiosRetry from "axios-retry";

// Environment variable validation
const validateEnvironment = () => {
  if (!process.env.REACT_APP_API_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "REACT_APP_API_URL is not defined. Please set it in the environment for production."
      );
    } else {
      console.warn(
        "REACT_APP_API_URL is not defined. Defaulting to localhost for development."
      );
    }
  }
};

// Call validation before creating the API instance.
validateEnvironment();

// Default API URL for development fallback
const DEFAULT_API_URL = "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
  withCredentials: true,
});

// Add retry mechanism
axiosRetry(api, { retries: 3 });

// Add request interceptor to ensure auth headers are sent
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving auth token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication error:", error.response.data);
      if (window.location.pathname !== "/login") {
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
