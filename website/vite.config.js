import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Shares the Firebase config in ../.env.local with the admin app.
  envDir: "..",
  server: { port: 5173 },
});
