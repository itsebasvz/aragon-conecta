import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  inicio,
  catalogo,
  galeria,
  getConferencia,
  detalle,
  comentar,
  apiConferencias,
  apiComentarios,
} from "../controllers/inicioController.js";
import { wantsJson } from "../middleware/security.js";
const router = Router();
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
router.get("/", inicio);
router.get("/conferencias", catalogo);
router.get("/conferencias/:slug", getConferencia, detalle);
router.get("/conferencias/hello-world/materiales", (req, res) =>
  res.render("materiales", { title: "Presentación de Hello World" }),
);
router.post(
  "/conferencias/:slug/comentarios",
  commentLimit,
  getConferencia,
  comentar,
);
router.get("/galeria", galeria);
router.get("/acerca", (req, res) =>
  res.render("acerca", { title: "Acerca del proyecto" }),
);
router.get("/privacidad", (req, res) =>
  res.render("privacidad", { title: "Información sobre comentarios" }),
);
router.get("/api/conferencias", apiConferencias);
router.get(
  "/api/conferencias/:slug/comentarios",
  getConferencia,
  apiComentarios,
);
export default router;
