import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
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
process.env.ADMIN_EMAIL = "admin@pruebas.local";
process.env.ADMIN_PASSWORD = "Pruebas-locales-2027-1";
if (!process.env.BD_NOMBRE.endsWith("_test"))
  throw new Error("La base de pruebas debe terminar en _test.");
