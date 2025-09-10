import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // Use modern Sass API
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3005",
    },
  },
});
