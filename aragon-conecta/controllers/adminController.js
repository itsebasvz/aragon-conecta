// Gestiona el acceso y la moderación. El administrador puede buscar comentarios, cambiar
// su estado y eliminarlos con confirmación.
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { Op } from "sequelize";
import { Administrador, Comentario, Conferencia } from "../models/index.js";
import { flash } from "../middleware/security.js";
// Hace una comparación de contraseña también cuando el correo no existe, para que la
// respuesta no delate esa diferencia de tiempo fácilmente.
const dummyHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);
// Conserva los filtros al volver al panel. Sólo acepta una dirección de /admin para evitar
// redirecciones a sitios externos.
function returnToPanel(value) {
  if (typeof value === "string" && value.length <= 1000 && /^\/admin(?:\?|$)/.test(value)) {
    const url = new URL(value, "http://panel.local");
    if (url.origin === "http://panel.local" && url.pathname === "/admin")
      return `${url.pathname}${url.search}#moderacion-feedback`;
  }
  return "/admin#moderacion-feedback";
}
// Si ya inició sesión, manda al panel; en otro caso muestra el formulario de acceso.
export const loginForm = (req, res) =>
  req.session.adminId
    ? res.redirect("/admin")
    : res.render("admin/login", {
        title: "Acceso de administración",
        error: null,
      });
// Limpia el correo, limita la contraseña al tamaño que acepta bcrypt y busca al
// administrador.
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
// bcrypt comprueba la contraseña contra el hash guardado; no se compara con una contraseña
// en texto plano.
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
// Al entrar se crea un identificador de sesión nuevo. Luego se guarda el id del
// administrador antes de redirigir.
  await new Promise((resolve, reject) =>
    req.session.regenerate((error) => (error ? reject(error) : resolve())),
  );
  req.session.adminId = admin.id;
  await new Promise((resolve, reject) =>
    req.session.save((error) => (error ? reject(error) : resolve())),
  );
  res.redirect(303, "/admin");
}
// Destruye la sesión guardada y borra su cookie del navegador.
export async function logout(req, res) {
  await new Promise((resolve, reject) =>
    req.session.destroy((error) => (error ? reject(error) : resolve())),
  );
  res.clearCookie("semana.sid");
  res.redirect(303, "/admin/login");
}
// Lee los filtros de la URL y prepara la lista de comentarios y los contadores del panel.
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
// La conferencia y la búsqueda forman la selección base. La búsqueda revisa nombre o
// mensaje.
  const scope = {
    ...(seleccionada && { conferenciaId: seleccionada.id }),
    ...(q && { [Op.or]: [
      { nombre: { [Op.like]: `%${q}%` } },
      { mensaje: { [Op.like]: `%${q}%` } },
    ] }),
  };
// El estado se agrega a la selección sólo para la lista; los contadores siguen mostrando
// todos los estados de esa selección.
  const where = {
    ...scope,
    ...(estado && { estado }),
  };
// Una página inválida se trata como la primera. Cada página muestra veinte comentarios.
  const requestedPage = Number(req.query.pagina);
  const requested =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    requestedPage < 100000
      ? requestedPage
      : 1;
// Estas dos consultas independientes pueden hacerse al mismo tiempo: total de resultados y
// total por estado.
  const [count, grouped] = await Promise.all([
    Comentario.count({ where }),
    Comentario.count({ where: scope, group: ["estado"] }),
  ]);
  const paginas = Math.ceil(count / 20);
// Si se borró el último resultado de una página, vuelve a la última página que todavía
// exista.
  const pagina = Math.min(requested, Math.max(1, paginas));
// Trae también el título y la URL de la conferencia para identificar de dónde salió cada
// comentario.
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
// Construye enlaces conservando búsqueda y conferencia. URLSearchParams se encarga de
// codificar sus valores.
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
// Sólo cambia el estado del comentario. Rechaza valores desconocidos o ids que ya no
// existen.
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
// Exige la confirmación del formulario antes de borrar definitivamente el comentario.
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
