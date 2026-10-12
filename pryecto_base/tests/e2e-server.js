import "./env.js";
import bcrypt from "bcryptjs";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { sessionStore } from "../config/session.js";
import { Conferencia, Administrador } from "../models/index.js";
import { conferencias } from "../data/conferencias.js";
await db.authenticate();
await db.sync();
for (const c of conferencias)
  await Conferencia.findOrCreate({ where: { slug: c.slug }, defaults: c });
await Administrador.findOrCreate({
  where: { email: process.env.ADMIN_EMAIL },
  defaults: { passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) },
});
const server = createApp().listen(2810, "127.0.0.1");
process.on("SIGTERM", () =>
  server.close(async () => {
    sessionStore.stopExpiringSessions();
    await db.close();
  }),
);
