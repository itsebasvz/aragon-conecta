// Servidor que Playwright abre para probar la web en un navegador. Usa la base aislada de
// tests/env.js y un puerto distinto al de la aplicación.
import "./env.js";
import bcrypt from "bcryptjs";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { sessionStore } from "../config/session.js";
import { Conferencia, Administrador } from "../models/index.js";
import { conferencias } from "../data/conferencias.js";
// Prepara las tablas y los datos necesarios para que las pruebas tengan conferencias y un
// administrador.
await db.authenticate();
await db.sync();
for (const c of conferencias)
  await Conferencia.findOrCreate({ where: { slug: c.slug }, defaults: c });
await Administrador.findOrCreate({
  where: { email: process.env.ADMIN_EMAIL },
  defaults: { passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) },
});
// El puerto 2810 deja libre el 2800 de la aplicación normal.
const server = createApp().listen(2810, "127.0.0.1");
// Cuando Playwright termina, cierra el servidor y la conexión de pruebas.
process.on("SIGTERM", () =>
  server.close(async () => {
    sessionStore.stopExpiringSessions();
    await db.close();
  }),
);
