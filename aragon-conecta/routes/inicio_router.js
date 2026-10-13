// Relaciona cada dirección pública con el controlador que debe atenderla. GET consulta;
// POST envía un comentario.
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  inicio,
  catalogo,
  getConferencia,
  detalle,
  comentar,
  apiConferencias,
  apiComentarios,
} from "../controllers/inicioController.js";
import { wantsJson } from "../middleware/security.js";
const router = Router();
// Limita los envíos repetidos de comentarios: hasta diez por dirección en quince minutos.
const commentLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(req, res) {
    const message =
      "Has enviado varias reflexiones. Espera 15 minutos para volver a intentarlo.";
    if (wantsJson(req)) return res.status(429).json({ mensaje: message });
    res
      .status(429)
      .render("error", { title: "Espera un momento", status: 429, message });
  },
});
// Las rutas de páginas usan EJS. getConferencia busca primero el registro que necesitan el
// detalle y los comentarios.
router.get("/", inicio);
router.get("/conferencias", catalogo);
router.get("/conferencias/:slug", getConferencia, detalle);
// Muestra la presentación local de Hello World, sin descargar diapositivas desde otro
// sitio.
router.get("/conferencias/hello-world/materiales", (req, res) =>
  res.render("materiales", { title: "Presentación de Hello World" }),
);
// Antes de guardar una reflexión se aplican el límite de envíos y la búsqueda de la
// conferencia.
router.post(
  "/conferencias/:slug/comentarios",
  commentLimit,
  getConferencia,
  comentar,
);
router.get("/acerca", (req, res) =>
  res.render("acerca", { title: "Acerca del proyecto" }),
);
router.get("/privacidad", (req, res) =>
  res.render("privacidad", { title: "Información sobre comentarios" }),
);
// Las rutas /api ofrecen datos JSON para clientes que no necesitan una página HTML.
router.get("/api/conferencias", apiConferencias);
router.get(
  "/api/conferencias/:slug/comentarios",
  getConferencia,
  apiComentarios,
);
export default router;
