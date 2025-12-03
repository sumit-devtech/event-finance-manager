import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [remix()],
  server: {
    port: 5173, // Frontend runs on 5173, backend-simplifi on 3333 (or 3334 if PORT env not set)
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
  // These warnings are harmless - Tailwind v4 uses valid CSS that the parser doesn't recognize
  logLevel: "error", // Only show errors, suppress warnings
});

