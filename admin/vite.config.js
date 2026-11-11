import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Shares the Firebase config in ../.env.local with the public website.
  envDir: "..",
  server: { port: 5174 },
});
