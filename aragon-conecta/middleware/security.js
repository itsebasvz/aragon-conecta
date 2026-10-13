import { randomBytes, timingSafeEqual } from "node:crypto";
export const wantsJson = (req) =>
  req.is("application/json") || req.get("accept")?.includes("application/json");
export function csrf(req, res, next) {
  if (!req.session.csrf) req.session.csrf = randomBytes(32).toString("hex");
  res.locals.csrf = req.session.csrf;
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const token = req.get("x-csrf-token") || req.body?._csrf;
    if (
      typeof token !== "string" ||
      Buffer.byteLength(token) !== Buffer.byteLength(req.session.csrf) ||
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
export function requireAdmin(req, res, next) {
  if (req.session.adminId) return next();
  if (wantsJson(req))
    return res.status(401).json({ mensaje: "Inicia sesión para continuar." });
  res.redirect("/admin/login");
}
export function flash(req, type, message) {
  req.session.flash = { type, message };
}
