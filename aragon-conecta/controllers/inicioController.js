// Atiende las páginas públicas y las consultas JSON. Obtiene los datos desde los modelos y
// se los pasa a EJS para construir las páginas.
import { Conferencia, Comentario } from "../models/index.js";
import { wantsJson, flash } from "../middleware/security.js";
// Comparte una consulta para obtener las conferencias en el orden definido por el
// proyecto.
export const getConferencias = () =>
  Conferencia.findAll({ order: [["orden", "ASC"]] });
// La portada necesita la lista de conferencias para dibujar sus tarjetas.
export async function inicio(req, res) {
  res.render("inicio", {
    title: "Semana de Ingeniería 2027-1",
    conferencias: await getConferencias(),
  });
}
// La página de catálogo muestra la misma selección con su introducción propia.
export async function catalogo(req, res) {
  res.render("conferencias", {
    title: "Conferencias",
    conferencias: await getConferencias(),
  });
}
// Busca la conferencia indicada en la URL y la deja en req para el siguiente controlador.
// Si no existe, la petición terminará como 404.
export async function getConferencia(req, res, next) {
  const conferencia = await Conferencia.findOne({
    where: { slug: req.params.slug },
  });
  if (!conferencia) return next("route");
  req.conferencia = conferencia;
  next();
}
// Consulta las últimas cincuenta reflexiones aprobadas y muestra el detalle de la
// conferencia.
export async function detalle(req, res) {
  const comentarios = await Comentario.findAll({
    where: { conferenciaId: req.conferencia.id, estado: "aprobado" },
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    limit: 50,
  });
  res.render("detalle", {
    title: req.conferencia.titulo,
    description: req.conferencia.resumen,
    conferencia: req.conferencia,
    comentarios,
    errors: {},
    values: {},
  });
}
// Recibe un formulario de reflexión. Siempre valida los datos en el servidor, aunque el
// navegador ya los haya revisado.
export async function comentar(req, res) {
  const nombre =
    typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
  const mensaje =
    typeof req.body.mensaje === "string" ? req.body.mensaje.trim() : "";
// Reúne los errores por campo para que la página pueda explicar qué debe corregirse.
  const errors = {};
  if (nombre.length < 2 || nombre.length > 60)
    errors.nombre = "Escribe un nombre de entre 2 y 60 caracteres.";
  if (mensaje.length < 10 || mensaje.length > 1500)
    errors.mensaje = "Escribe una reflexión de entre 10 y 1500 caracteres.";
  if (req.body.acepto !== "si")
    errors.acepto = "Confirma que leíste la información sobre comentarios.";
// Si hay errores, devuelve JSON a fetch o vuelve a mostrar el formulario HTML con el texto
// que escribió el visitante.
  if (Object.keys(errors).length) {
    if (wantsJson(req))
      return res
        .status(400)
        .json({ mensaje: "Revisa los campos indicados.", errors });
    const comentarios = await Comentario.findAll({
      where: { conferenciaId: req.conferencia.id, estado: "aprobado" },
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      limit: 50,
    });
    return res
      .status(400)
      .render("detalle", {
        title: req.conferencia.titulo,
        conferencia: req.conferencia,
        comentarios,
        errors,
        values: { nombre, mensaje },
      });
  }
// Sólo guarda los campos permitidos. El estado pendiente viene del modelo y no puede
// elegirlo el visitante.
  await Comentario.create({
    conferenciaId: req.conferencia.id,
    nombre,
    mensaje,
  });
  const confirmacion =
    "Gracias por compartir tu reflexión. Se publicará después de ser revisada.";
  if (wantsJson(req))
    return res.status(201).json({ mensaje: confirmacion, estado: "pendiente" });
  flash(req, "success", confirmacion);
// Después de guardar un formulario HTML, redirige al detalle para evitar un reenvío al
// recargar.
  res.redirect(303, `/conferencias/${req.conferencia.slug}#comentarios`);
}
// Devuelve una lista JSON con datos públicos. No envía el contenido interno completo de
// cada registro.
export async function apiConferencias(req, res) {
  res.json(
    (await getConferencias()).map((c) => ({
      slug: c.slug,
      titulo: c.titulo,
      categoria: c.categoria,
      resumen: c.resumen,
      fecha: c.fecha,
      horario: c.horario,
      sede: c.sede,
      url: `/conferencias/${c.slug}`,
    })),
  );
}
// La API también filtra por aprobado: los comentarios pendientes o rechazados siguen
// siendo privados.
export async function apiComentarios(req, res) {
  res.json(
    await Comentario.findAll({
      where: { conferenciaId: req.conferencia.id, estado: "aprobado" },
      attributes: ["nombre", "mensaje", "createdAt"],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      limit: 50,
    }),
  );
}
