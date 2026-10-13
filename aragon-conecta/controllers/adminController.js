import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { Op } from "sequelize";
import { Administrador, Comentario, Conferencia } from "../models/index.js";
import { flash } from "../middleware/security.js";
const dummyHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);
function returnToPanel(value) {
  if (typeof value === "string" && value.length <= 1000 && /^\/admin(?:\?|$)/.test(value)) {
    const url = new URL(value, "http://panel.local");
    if (url.origin === "http://panel.local" && url.pathname === "/admin")
      return `${url.pathname}${url.search}#moderacion-feedback`;
  }
  return "/admin#moderacion-feedback";
}
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
  const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  const scope = {
    ...(seleccionada && { conferenciaId: seleccionada.id }),
    ...(q && { [Op.or]: [
      { nombre: { [Op.like]: `%${q}%` } },
      { mensaje: { [Op.like]: `%${q}%` } },
    ] }),
  };
  const where = {
    ...scope,
    ...(estado && { estado }),
  };
  const requestedPage = Number(req.query.pagina);
  const requested =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    requestedPage < 100000
      ? requestedPage
      : 1;
  const [count, grouped] = await Promise.all([
    Comentario.count({ where }),
    Comentario.count({ where: scope, group: ["estado"] }),
  ]);
  const paginas = Math.ceil(count / 20);
  const pagina = Math.min(requested, Math.max(1, paginas));
  const comentarios = await Comentario.findAll({
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
  const totals = { pendiente: 0, aprobado: 0, rechazado: 0, todos: 0 };
  for (const row of grouped) {
    totals[row.estado] = Number(row.count);
    totals.todos += Number(row.count);
  }
  const filterUrl = (state = estado, page = 1) => {
    const query = new URLSearchParams();
    if (state) query.set("estado", state);
    if (seleccionada) query.set("conferencia", seleccionada.slug);
    if (q) query.set("q", q);
    if (page > 1) query.set("pagina", String(page));
    return `/admin${query.size ? `?${query}` : ""}`;
  };
  res.render("admin/panel", {
    title: "Moderación de comentarios",
    comentarios,
    conferencias,
    estado,
    slug: seleccionada?.slug || "",
    pagina,
    paginas,
    count,
    q,
    totals,
    filterUrl,
    returnTo: filterUrl(estado, pagina),
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
  const messages = {
    aprobado: "Comentario aprobado. Ya es visible en la conferencia.",
    rechazado: "Comentario rechazado. Permanece oculto al público.",
    pendiente: "Comentario devuelto a pendientes. Esperará una nueva revisión.",
  };
  flash(req, "success", messages[req.body.estado]);
  res.redirect(303, returnToPanel(req.body.volver));
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
  res.redirect(303, returnToPanel(req.body.volver));
}
