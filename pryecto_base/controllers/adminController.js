import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { Administrador, Comentario, Conferencia } from "../models/index.js";
import { flash } from "../middleware/security.js";
const dummyHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);
export const loginForm = (req, res) =>
  req.session.adminId
    ? res.redirect("/admin")
    : res.render("admin/login", {
        title: "Acceso de administración",
        error: null,
      });
export async function login(req, res) {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" &&
    Buffer.byteLength(req.body.password) <= 72
      ? req.body.password
      : "";
  const admin =
    email.length <= 254
      ? await Administrador.findOne({ where: { email } })
      : null;
  const valid = await bcrypt.compare(
    password,
    admin?.passwordHash || dummyHash,
  );
  if (!admin || !valid)
    return res
      .status(401)
      .render("admin/login", {
        title: "Acceso de administración",
        error: "El correo o la contraseña no son correctos.",
      });
  await new Promise((resolve, reject) =>
    req.session.regenerate((error) => (error ? reject(error) : resolve())),
  );
  req.session.adminId = admin.id;
  await new Promise((resolve, reject) =>
    req.session.save((error) => (error ? reject(error) : resolve())),
  );
  res.redirect(303, "/admin");
}
export async function logout(req, res) {
  await new Promise((resolve, reject) =>
    req.session.destroy((error) => (error ? reject(error) : resolve())),
  );
  res.clearCookie("semana.sid");
  res.redirect(303, "/admin/login");
}
export async function panel(req, res) {
  const estado = ["pendiente", "aprobado", "rechazado"].includes(
    req.query.estado,
  )
    ? req.query.estado
    : "";
  const slug =
    typeof req.query.conferencia === "string" ? req.query.conferencia : "";
  const conferencias = await Conferencia.findAll({ order: [["orden", "ASC"]] });
  const seleccionada = conferencias.find((c) => c.slug === slug);
  const where = {
    ...(estado && { estado }),
    ...(seleccionada && { conferenciaId: seleccionada.id }),
  };
  const requestedPage = Number(req.query.pagina);
  const pagina =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    requestedPage < 100000
      ? requestedPage
      : 1;
  const { rows: comentarios, count } = await Comentario.findAndCountAll({
    where,
    include: [
      { model: Conferencia, as: "conferencia", attributes: ["titulo", "slug"] },
    ],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    limit: 20,
    offset: (pagina - 1) * 20,
  });
  res.render("admin/panel", {
    title: "Moderación de comentarios",
    comentarios,
    conferencias,
    estado,
    slug: seleccionada?.slug || "",
    pagina,
    paginas: Math.ceil(count / 20),
    count,
  });
}
export async function actualizar(req, res) {
  if (!["pendiente", "aprobado", "rechazado"].includes(req.body.estado))
    return res
      .status(400)
      .render("error", {
        title: "Estado inválido",
        status: 400,
        message: "Selecciona un estado válido para el comentario.",
      });
  const comentario = /^\d+$/.test(req.params.id)
    ? await Comentario.findByPk(req.params.id)
    : null;
  if (!comentario)
    return res
      .status(404)
      .render("error", {
        title: "Comentario no encontrado",
        status: 404,
        message: "Este comentario ya no está disponible.",
      });
  await comentario.update({ estado: req.body.estado });
  flash(req, "success", "Se actualizó el estado del comentario.");
  res.redirect(303, "/admin");
}
export async function eliminar(req, res) {
  if (req.body.confirmar !== "eliminar")
    return res
      .status(400)
      .render("error", {
        title: "Confirma la eliminación",
        status: 400,
        message: "Marca la confirmación antes de eliminar el comentario.",
      });
  const comentario = /^\d+$/.test(req.params.id)
    ? await Comentario.findByPk(req.params.id)
    : null;
  if (!comentario)
    return res
      .status(404)
      .render("error", {
        title: "Comentario no encontrado",
        status: 404,
        message: "Este comentario ya no está disponible.",
      });
  await comentario.destroy();
  flash(req, "success", "El comentario se eliminó de forma permanente.");
  res.redirect(303, "/admin");
}
