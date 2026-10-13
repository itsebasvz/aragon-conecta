// Prepara una configuración exclusiva para pruebas. Cambia el nombre y el puerto de la
// base para no tocar los datos de la aplicación.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
// Lee las claves de conexión locales sin imprimirlas. Después reemplaza los valores que
// deben ser sólo de prueba.
dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
  quiet: true,
});
// Las pruebas nunca reciben el nombre ni el puerto de la base de la aplicación.
process.env.NODE_ENV = "test";
process.env.BD_NOMBRE = process.env.TEST_BD_NOMBRE || "semana_ingenieria_test";
process.env.BD_PORT = process.env.TEST_BD_PORT || "3308";
process.env.BD_HOST = process.env.TEST_BD_HOST || "127.0.0.1";
process.env.SESSION_SECRET =
  "sesion-exclusiva-de-pruebas-no-utilizar-en-produccion";
// Estas credenciales son datos de prueba; no son las del administrador de la aplicación.
process.env.ADMIN_EMAIL = "admin@pruebas.local";
process.env.ADMIN_PASSWORD = "Pruebas-locales-2027-1";
// La terminación _test es una comprobación obligatoria antes de permitir que las pruebas
// recrean tablas.
if (!process.env.BD_NOMBRE.endsWith("_test"))
  throw new Error("La base de pruebas debe terminar en _test.");
