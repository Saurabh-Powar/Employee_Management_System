import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Ensures relative paths for assets
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://employee-management-system-gv8r.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  
  define: {
    // Define global constants at build time
    "process.env.BACKEND_URL": JSON.stringify("https://employee-management-system-gv8r.onrender.com"),
  },
})
