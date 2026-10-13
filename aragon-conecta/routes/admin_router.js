// Define las direcciones de administración. Sólo el formulario de acceso se puede
// consultar sin una sesión administrativa.
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
// Pide a los buscadores que no indexen estas páginas privadas.
router.use((req, res, next) => {
  res.set("X-Robots-Tag", "noindex, nofollow");
  next();
});
// Cuenta los intentos fallidos de acceso. Los inicios de sesión correctos no consumen este
// límite.
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
// A partir de aquí, todas las rutas deben pasar la comprobación de administrador.
router.use(requireAdmin);
router.get("/", panel);
router.post("/logout", logout);
// PUT actualiza el estado y DELETE elimina. Los formularios HTML lo indican con _method.
router.put("/comentarios/:id", actualizar);
router.delete("/comentarios/:id", eliminar);
export default router;
