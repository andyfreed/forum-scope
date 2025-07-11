import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: 'client/index.minimal.html'
    }
  },
});