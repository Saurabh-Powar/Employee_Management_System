import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Ensures relative paths for assets
  build: {
    outDir: "dist",
  },
  server: {
    port: 5000,
    open: true,
    proxy: {
      // Proxy API requests to the backend during development
      "/api": {
        target: "https://employee-management-system-gv8r.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    // Define global constants at build time
    "process.env.BACKEND_URL": JSON.stringify("https://employee-management-system-gv8r.onrender.com"),
  },
})
