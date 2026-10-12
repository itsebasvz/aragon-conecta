import { Conferencia, Comentario } from '../models/index.js';
import { wantsJson, flash } from '../middleware/security.js';
export const getConferencias = () => Conferencia.findAll({ order: [['orden', 'ASC']] });
export async function inicio(req, res) { res.render('inicio', { title: 'Semana de Ingeniería 2027-1', conferencias: await getConferencias() }); }
export async function catalogo(req, res) { res.render('conferencias', { title: 'Conferencias', conferencias: await getConferencias() }); }
export async function galeria(req, res) { res.render('galeria', { title: 'Memoria fotográfica', conferencias: await getConferencias() }); }
export async function getConferencia(req, res, next) {
  const conferencia = await Conferencia.findOne({ where: { slug: req.params.slug } });
  if (!conferencia) return next('route');
  req.conferencia = conferencia;
  next();
}
export async function detalle(req, res) {
  const comentarios = await Comentario.findAll({ where: { conferenciaId: req.conferencia.id, estado: 'aprobado' }, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 50 });
  res.render('detalle', { title: req.conferencia.titulo, description: req.conferencia.resumen, conferencia: req.conferencia, comentarios, errors: {}, values: {} });
}
export async function comentar(req, res) {
  const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
  const mensaje = typeof req.body.mensaje === 'string' ? req.body.mensaje.trim() : '';
  const errors = {};
  if (nombre.length < 2 || nombre.length > 60) errors.nombre = 'Escribe un nombre de entre 2 y 60 caracteres.';
  if (mensaje.length < 10 || mensaje.length > 1500) errors.mensaje = 'Escribe una reflexión de entre 10 y 1500 caracteres.';
  if (req.body.acepto !== 'si') errors.acepto = 'Confirma que leíste la información sobre comentarios.';
  if (Object.keys(errors).length) {
    if (wantsJson(req)) return res.status(400).json({ mensaje: 'Revisa los campos indicados.', errors });
    const comentarios = await Comentario.findAll({ where: { conferenciaId: req.conferencia.id, estado: 'aprobado' }, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 50 });
    return res.status(400).render('detalle', { title: req.conferencia.titulo, conferencia: req.conferencia, comentarios, errors, values: { nombre, mensaje } });
  }
  await Comentario.create({ conferenciaId: req.conferencia.id, nombre, mensaje });
  const confirmacion = 'Gracias por compartir tu reflexión. Se publicará después de ser revisada.';
  if (wantsJson(req)) return res.status(201).json({ mensaje: confirmacion, estado: 'pendiente' });
  flash(req, 'success', confirmacion);
  res.redirect(303, `/conferencias/${req.conferencia.slug}#comentarios`);
}
export async function apiConferencias(req, res) {
  res.json((await getConferencias()).map(c => ({ slug: c.slug, titulo: c.titulo, categoria: c.categoria, resumen: c.resumen, fecha: c.fecha, horario: c.horario, sede: c.sede, url: `/conferencias/${c.slug}` })));
}
export async function apiComentarios(req, res) {
  res.json(await Comentario.findAll({ where: { conferenciaId: req.conferencia.id, estado: 'aprobado' }, attributes: ['nombre', 'mensaje', 'createdAt'], order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 50 }));
}
