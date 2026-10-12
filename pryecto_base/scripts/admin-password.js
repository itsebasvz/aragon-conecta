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
  await db.transaction(async (transaction) => {
    await admin.update(
      { passwordHash: await bcrypt.hash(password, 12) },
      { transaction },
    );
    const sessions = await db.models.Session.findAll({ transaction });
    for (const saved of sessions) {
      let data;
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
} finally {
  sessionStore.stopExpiringSessions();
  await db.close();
}
