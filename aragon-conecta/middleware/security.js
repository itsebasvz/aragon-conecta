// Funciones que se ejecutan antes de los controladores. Revisan el formato de respuesta,
// protegen formularios y comprueban el acceso administrativo.
import { randomBytes, timingSafeEqual } from "node:crypto";
// Detecta si quien llamó espera JSON, por ejemplo el formulario que usa fetch.
export const wantsJson = (req) =>
  req.is("application/json") || req.get("accept")?.includes("application/json");
// Un token es una clave aleatoria asociada a la sesión. Cada formulario debe devolver esa
// misma clave al enviarse.
export function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = randomBytes(32).toString("hex");
  res.locals.csrf = req.session.csrf;
// Las consultas de lectura no modifican datos. Para las demás peticiones sí se exige el
// token.
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const token = req.get("x-csrf-token") || req.body?._csrf;
    if (
      typeof token !== "string" ||
      Buffer.byteLength(token) !== Buffer.byteLength(req.session.csrf) ||
// Compara los tokens con una función que evita revelar coincidencias por diferencias de
// tiempo.
      !timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrf))
    ) {
      return wantsJson(req)
        ? res
            .status(403)
            .json({
              mensaje: "La sesión del formulario venció. Recarga la página.",
            })
        : res
            .status(403)
            .render("error", {
              title: "Formulario vencido",
              status: 403,
              message:
                "Recarga la página antes de volver a enviar el formulario.",
            });
    }
  }
  next();
}
// Deja pasar a quien tenga una sesión de administrador; al resto le pide iniciar sesión.
export function requireAdmin(req, res, next) {
  if (req.session.adminId) return next();
  if (wantsJson(req))
    return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
  res.redirect("/admin/login");
}
// Guarda un mensaje corto en la sesión para mostrarlo en la siguiente página.
export function flash(req, type, message) {
  req.session.flash = { type, message };
}
