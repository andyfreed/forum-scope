import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath, URL } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: "client",
  resolve: {
    alias: {
      "@": resolve(__dirname, "client/src"),
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        console.log("Rollup warning:", warning.code, warning.message);
        warn(warning);
      }
    }
  },
});
