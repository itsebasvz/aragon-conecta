// Lee .env y reúne la configuración en un solo objeto. Los demás archivos usan este objeto
// en lugar de repetir las variables de entorno.
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Calcula la carpeta de la aplicación a partir de este archivo; no depende de dónde se
// abrió la terminal.
export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: `${projectRoot}.env`, quiet: true });
const secret = process.env.SESSION_SECRET;
// La clave de sesión debe ser suficientemente larga. No se inventa una clave fija si falta
// la configuración.
if (!secret || secret.length < 32)
  throw new Error(
    "Configura SESSION_SECRET con al menos 32 caracteres en .env. Consulta .env.example.",
  );
// Convierte puertos a números y el modo de producción a verdadero o falso. Los valores por
// defecto sirven para desarrollo local.
export const config = {
  production: process.env.NODE_ENV === "production",
  secret,
  port: Number(process.env.PORT || 2800),
  host: process.env.HOST || "127.0.0.1",
  trustProxy: process.env.TRUST_PROXY === "1" ? 1 : false,
  database: {
    name: process.env.BD_NOMBRE || "semana_ingenieria",
    user: process.env.BD_USUARIO || "semana",
    password: process.env.BD_CLAVE || "",
    host: process.env.BD_HOST || "127.0.0.1",
    port: Number(process.env.BD_PORT || 3306),
  },
};
