// Prepara las tablas que falten antes de arrancar. No borra tablas ni cambia
// automáticamente las columnas existentes.
import "../models/index.js";
import { db } from "../config/db.js";
import { sessionStore } from "../config/session.js";
try {
  await db.authenticate();
  // Crea tablas faltantes. Nunca elimina ni altera tablas existentes.
// Sequelize usa las definiciones de models para crear las tablas pendientes.
  await db.sync();
  console.log(
    "Tablas listas. Ejecuta npm run db:seed para cargar las conferencias.",
  );
} catch (error) {
  console.error("No se pudo preparar la base de datos:", error.message);
  process.exitCode = 1;
// Cierra la conexión y la tarea que revisa sesiones para que este comando termine
// correctamente.
} finally {
  sessionStore.stopExpiringSessions();
  await db.close();
}
