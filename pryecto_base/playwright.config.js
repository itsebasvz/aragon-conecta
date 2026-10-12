import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:2810",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/e2e-server.js",
    url: "http://127.0.0.1:2810/health",
    reuseExistingServer: false,
    timeout: 60000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
