import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    fs: {
      // Allow Vite to serve files from the sibling Phase 1 app + test-data
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "../frontend"),
        path.resolve(__dirname, "../test-data"),
      ],
    },
  },
  resolve: {
    alias: {
      "@test-data": path.resolve(__dirname, "./test-data"),
      "@phase1": path.resolve(__dirname, "./phase1-src"),
    },
  },
});
