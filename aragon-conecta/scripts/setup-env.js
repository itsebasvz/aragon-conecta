import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
let template = await readFile(`${root}.env.example`, "utf8");
const replacements = {
  BD_CLAVE: randomBytes(24).toString("base64url"),
  BD_ROOT_CLAVE: randomBytes(24).toString("base64url"),
  SESSION_SECRET: randomBytes(48).toString("base64url"),
  ADMIN_EMAIL: "admin@semana.local",
  ADMIN_PASSWORD: randomBytes(18).toString("base64url"),
  BD_PORT: "3307",
};
for (const [key, value] of Object.entries(replacements))
  template = template.replace(
    new RegExp(`^${key}=.*$`, "m"),
    `${key}=${value}`,
  );
try {
  await writeFile(`${root}.env`, template, { flag: "wx", mode: 0o600 });
  console.log(
    "Archivo .env creado con claves únicas. Consulta ADMIN_EMAIL y ADMIN_PASSWORD en ese archivo para iniciar sesión.",
  );
} catch (error) {
  if (error.code === "EEXIST")
    console.log("Ya existe .env; se conservó sin modificaciones.");
  else throw error;
}
