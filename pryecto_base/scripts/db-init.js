import '../models/index.js';
import { db } from '../config/db.js';
import { sessionStore } from '../config/session.js';
try {
  await db.authenticate();
  // Crea tablas faltantes. Nunca elimina ni altera tablas existentes.
  await db.sync();
  console.log('Tablas listas. Ejecuta npm run db:seed para cargar las conferencias.');
} catch (error) {
  console.error('No se pudo preparar la base de datos:', error.message);
  process.exitCode = 1;
} finally {
  sessionStore.stopExpiringSessions();
  await db.close();
}
