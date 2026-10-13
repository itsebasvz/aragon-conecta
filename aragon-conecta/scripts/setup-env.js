// Crea un .env local con claves aleatorias para la base de datos, la sesión y el
// administrador. No muestra las claves en la terminal.
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
let template = await readFile(`${root}.env.example`, "utf8");
// Parte de .env.example y reemplaza sus valores de ejemplo por claves nuevas.
const replacements = {
  BD_CLAVE: randomBytes(24).toString("base64url"),
  BD_ROOT_CLAVE: randomBytes(24).toString("base64url"),
  SESSION_SECRET: randomBytes(48).toString("base64url"),
  ADMIN_EMAIL: "admin@semana.local",
  ADMIN_PASSWORD: randomBytes(18).toString("base64url"),
  BD_PORT: "3307",
};
// Cambia sólo la línea de cada variable conocida en la plantilla.
for (const [key, value] of Object.entries(replacements))
  template = template.replace(
    new RegExp(`^${key}=.*$`, "m"),
    `${key}=${value}`,
  );
try {
// wx significa crear sin sobrescribir. El permiso 600 permite leer y escribir sólo al
// propietario del archivo.
  await writeFile(`${root}.env`, template, { flag: "wx", mode: 0o600 });
  console.log(
    "Archivo .env creado con claves únicas. Consulta ADMIN_EMAIL y ADMIN_PASSWORD en ese archivo para iniciar sesión.",
  );
} catch (error) {
// Si ya hay un .env, lo conserva: así no cambia las claves de una instalación existente.
  if (error.code === "EEXIST")
    console.log("Ya existe .env; se conservó sin modificaciones.");
  else throw error;
}
