import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // The Vite dev proxy forwards /api/* requests to the gateway on :8080.
    // This means the browser always talks to localhost:3000 (same origin),
    // so CORS headers are never needed during development.
    // The gateway's CORS config only matters in production.
    proxy: {
      "/api": {
        target:       "http://localhost:8080",
        changeOrigin: true,
        secure:       false,
        // Rewrite the host header so the gateway doesn't see localhost:3000
        headers: { host: "localhost:8080" },
      },
      "/health": {
        target:       "http://localhost:8080",
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});
