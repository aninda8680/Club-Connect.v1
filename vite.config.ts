import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React into its own chunk
          react: ["react", "react-dom"],

          // Split Firebase (optional)
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
            "firebase/storage",
          ],

          // Example: chart libraries or other heavy deps
          // charts: ["recharts", "d3"],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // bump warning limit to 1 MB
  },
});
