// Configura las pruebas de navegador. Playwright abre un navegador sin ventana visible y
// visita el servidor exclusivo de pruebas.
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
// Se ejecutan de una en una porque los casos de prueba comparten la misma base de datos.
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  reporter: "list",
// La URL base simplifica las visitas. Si falla una prueba, se conserva su traza para
// revisar lo que ocurrió.
  use: {
    baseURL: "http://127.0.0.1:2810",
    headless: true,
    trace: "retain-on-failure",
  },
// Playwright inicia este servidor antes de los casos y espera a que /health confirme que
// está listo.
  webServer: {
    command: "node tests/e2e-server.js",
    url: "http://127.0.0.1:2810/health",
    reuseExistingServer: false,
    timeout: 60000,
    gracefulShutdown: { signal: "SIGTERM", timeout: 5000 },
  },
});
