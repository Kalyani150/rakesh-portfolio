import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Served under /admin on the same domain as the website.
  base: "/admin/",
  // Shares the Firebase config in ../.env.local with the public website.
  envDir: "..",
  server: { port: 5174 },
});
