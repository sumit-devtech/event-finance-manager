import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
  server: {
    port: 5173, // Frontend runs on 5173, backend on 3333
  },
  css: {
    postcss: "./postcss.config.js",
    devSourcemap: true,
  },
  build: {
    cssCodeSplit: true,
    cssMinify: true,
  },
  // Suppress CSS syntax warnings from Tailwind v4
  logLevel: "warn",
});

