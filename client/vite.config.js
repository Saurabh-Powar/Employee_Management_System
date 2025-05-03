import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  server: {
    port: "https://employee-management-system-d658.onrender.com", // Change this if necessary
  },
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
})
