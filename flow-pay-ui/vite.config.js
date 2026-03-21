import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Dev proxy — only active during local dev (npm run dev)
    // In production (Vercel), VITE_API_URL env var points directly to the gateway
    proxy: {
      "/api": {
        target:       process.env.VITE_API_URL || "http://localhost:8080",
        changeOrigin: true,
        secure:       false,
      },
    },
  },
});
