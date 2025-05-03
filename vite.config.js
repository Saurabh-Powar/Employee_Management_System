import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths for assets
  root: 'public', // Directory containing index.html
  build: {
    outDir: 'dist' // Output directory
  },
  server: {
    port: 5000, // Customize port if needed
    open: true, // Automatically open the app in the browser
  }
})
