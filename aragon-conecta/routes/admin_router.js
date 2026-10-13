import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { requireAdmin } from "../middleware/security.js";
import {
  loginForm,
  login,
  logout,
  panel,
  actualizar,
  eliminar,
} from "../controllers/adminController.js";
const router = Router();
router.use((req, res, next) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  next();
});
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(req, res) {
    res
      .status(429)
      .render("error", {
        title: "Espera un momento",
        status: 429,
        message:
          "Demasiados intentos de acceso. Inténtalo dentro de 15 minutos.",
      });
  },
});
router.get("/login", loginForm);
router.post("/login", loginLimit, login);
router.use(requireAdmin);
router.get("/", panel);
router.post("/logout", logout);
router.put("/comentarios/:id", actualizar);
router.delete("/comentarios/:id", eliminar);
export default router;
