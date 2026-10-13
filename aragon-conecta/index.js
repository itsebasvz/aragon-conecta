import { createApp } from "./app.js";
import { db } from "./config/db.js";
import { config } from "./config/env.js";
import { sessionStore } from "./config/session.js";

try {
  await db.authenticate();
  const server = createApp().listen(config.port, config.host, () => {
    console.log(`Semana de Ingeniería: http://localhost:${config.port}`);
  });
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    const timeout = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      sessionStore.stopExpiringSessions();
      await db.close();
      clearTimeout(timeout);
    });
  }
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
} catch (error) {
  console.error(
    "No se pudo iniciar. Revisa MariaDB y ejecuta npm run db:init.",
    error.message,
  );
  sessionStore.stopExpiringSessions();
  await db.close();
  process.exitCode = 1;
}
