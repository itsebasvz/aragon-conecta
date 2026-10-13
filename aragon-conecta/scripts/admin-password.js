// Cambia expresamente la contraseña de un administrador existente y cierra sus sesiones
// anteriores. Toma el correo y la nueva contraseña de .env.
import bcrypt from "bcryptjs";
import { db } from "../config/db.js";
import { Administrador } from "../models/index.js";
import { sessionStore } from "../config/session.js";

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password) > 72
  ) {
    throw new Error(
      "Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres, máximo 72 bytes).",
    );
  }
  const admin = await Administrador.findOne({ where: { email } });
  if (!admin)
    throw new Error("No existe ese administrador. Revisa ADMIN_EMAIL.");
// La contraseña nueva y el cierre de sesiones se guardan juntos para evitar dejar el
// cambio a medias.
  await db.transaction(async (transaction) => {
    await admin.update(
      { passwordHash: await bcrypt.hash(password, 12) },
      { transaction },
    );
// Revisa las sesiones guardadas y elimina sólo las que pertenecen a este administrador.
    const sessions = await db.models.Session.findAll({ transaction });
    for (const saved of sessions) {
      let data;
// Si una sesión tiene datos que no pueden leerse como JSON, la omite sin detener toda la
// operación.
      try {
        data = JSON.parse(saved.data);
      } catch {
        continue;
      }
      if (data.adminId === admin.id) await saved.destroy({ transaction });
    }
  });
  console.log(
    "Contraseña actualizada. Las sesiones anteriores de este administrador se cerraron.",
  );
} catch (error) {
  console.error("No se pudo cambiar la contraseña:", error.message);
  process.exitCode = 1;
// Libera los recursos aunque falle el cambio de contraseña.
} finally {
  sessionStore.stopExpiringSessions();
  await db.close();
}
