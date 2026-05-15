import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@test-data": path.resolve(__dirname, "../test-data"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "../test-data"),
      ],
    },
  },
});
