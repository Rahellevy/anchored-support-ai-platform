import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// In dev, Vite serves the app on :5173 and forwards API/SignalR traffic
// to the backend on :8080 — the same paths nginx proxies in Docker.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/hubs": { target: "http://localhost:8080", ws: true },
    }
  }
})
