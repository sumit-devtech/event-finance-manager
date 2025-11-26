// vite.config.ts
import { vitePlugin as remix } from "file:///Volumes/Work/My%20Work/event-finance-manager/node_modules/.pnpm/@remix-run+dev@2.9.1_@remix-run+react@2.9.1_@remix-run+serve@2.9.1_@types+node@20.19.25_ts-no_fxx3heqvfstzxk2uqg7jmsx7q4/node_modules/@remix-run/dev/dist/index.js";
import { defineConfig } from "file:///Volumes/Work/My%20Work/event-finance-manager/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.25/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Volumes/Work/My%20Work/event-finance-manager/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_typescript@5.9.3_vite@5.4.21/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*", "**/*.css"],
      serverModuleFormat: "esm"
    }),
    tsconfigPaths()
  ],
  server: {
    port: 5173
  },
  build: {
    sourcemap: process.env.NODE_ENV !== "production"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVm9sdW1lcy9Xb3JrL015IFdvcmsvZXZlbnQtZmluYW5jZS1tYW5hZ2VyL2FwcHMvc2ltcGxpZmktZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Wb2x1bWVzL1dvcmsvTXkgV29yay9ldmVudC1maW5hbmNlLW1hbmFnZXIvYXBwcy9zaW1wbGlmaS1mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVm9sdW1lcy9Xb3JrL015JTIwV29yay9ldmVudC1maW5hbmNlLW1hbmFnZXIvYXBwcy9zaW1wbGlmaS1mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHZpdGVQbHVnaW4gYXMgcmVtaXggfSBmcm9tIFwiQHJlbWl4LXJ1bi9kZXZcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVtaXgoe1xuICAgICAgaWdub3JlZFJvdXRlRmlsZXM6IFtcIioqLy4qXCIsIFwiKiovKi5jc3NcIl0sXG4gICAgICBzZXJ2ZXJNb2R1bGVGb3JtYXQ6IFwiZXNtXCIsXG4gICAgfSksXG4gICAgdHNjb25maWdQYXRocygpLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiLFxuICB9LFxufSk7XG5cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFgsU0FBUyxjQUFjLGFBQWE7QUFDOVosU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFFMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLE1BQ0osbUJBQW1CLENBQUMsU0FBUyxVQUFVO0FBQUEsTUFDdkMsb0JBQW9CO0FBQUEsSUFDdEIsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVyxRQUFRLElBQUksYUFBYTtBQUFBLEVBQ3RDO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
