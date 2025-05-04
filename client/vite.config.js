import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@context": "/src/context",
      "@services": "/src/services", // Add services directory if needed
    },
  },
  base: "./", // Use relative paths for assets
  build: {
    outDir: "dist",
    sourcemap: true, // Enable sourcemaps for debugging
    rollupOptions: {
      external: [], // Add external libraries if needed (e.g., CDN-hosted)
    },
  },
  server: {
    port: 5173, // Development server port
    proxy: {
      "/api": {
        target: "https://employee-management-system-gv8r.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // Rewrite paths for API calls
      },
    },
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self'; object-src 'none';",
      "X-Content-Type-Options": "nosniff",
    },
  },
  define: {
    "process.env.BACKEND_URL": JSON.stringify("https://employee-management-system-gv8r.onrender.com"),
  },
})
