// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
    deps: {
      optimizer: {
        web: {
          // Include libraries Vitest might struggle with in Node
          include: ["@testing-library/vue"],
          // Exclude libraries we intend to mock fully
          exclude: ["jspdf", "html2canvas"],
        },
      },
    },
  },
});
