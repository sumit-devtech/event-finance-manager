import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*", "**/*.css"],
      serverModuleFormat: "esm",
    }),
    tsconfigPaths(),
  ],
  server: {
    port: 5173,
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production",
  },
});

