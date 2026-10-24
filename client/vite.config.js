import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← THIS LINE IS REQUIRED
  ],
  server: {
    // Bind to 0.0.0.0 so other devices on the LAN can access the dev server.
    // Without this, Vite only listens on localhost and cross-device testing is impossible.
    host: true,
    port: 5173,
  },
});
