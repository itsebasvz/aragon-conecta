// Es el punto de arranque del servidor. Primero comprueba la base de datos y después
// empieza a recibir visitas.
import { createApp } from "./app.js";
import { db } from "./config/db.js";
import { config } from "./config/env.js";
import { sessionStore } from "./config/session.js";

try {
// Si la conexión falla, no abrimos el servidor: las páginas necesitan consultar MariaDB.
  await db.authenticate();
// createApp prepara Express; listen abre el puerto definido en la configuración.
  const server = createApp().listen(config.port, config.host, () => {
    console.log(`Semana de Ingeniería: http://localhost:${config.port}`);
  });
  let closing = false;
// Cuando Docker o la terminal piden detener el proceso, terminamos las conexiones de forma
// ordenada.
  async function shutdown() {
    if (closing) return;
    closing = true;
// Este límite evita que el apagado se quede esperando indefinidamente.
    const timeout = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      sessionStore.stopExpiringSessions();
      await db.close();
      clearTimeout(timeout);
    });
  }
// SIGTERM suele venir de Docker y SIGINT de Ctrl+C en la terminal.
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
// Deja un aviso de arranque fallido y un código de salida de error para quien ejecutó el
// proceso.
} catch (error) {
  console.error(
    "No se pudo iniciar. Revisa MariaDB y ejecuta npm run db:init.",
    error.message,
  );
  sessionStore.stopExpiringSessions();
  await db.close();
  process.exitCode = 1;
}
