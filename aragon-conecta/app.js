// Construye la aplicación de Express. Aquí se conectan las vistas, los archivos públicos,
// la sesión y las rutas, en el orden en que se revisará cada petición.
import express from "express";
import session from "express-session";
import methodOverride from "method-override";
import helmet from "helmet";
import path from "node:path";
import { config, projectRoot } from "./config/env.js";
import { db } from "./config/db.js";
import { sessionStore } from "./config/session.js";
import { csrf, wantsJson } from "./middleware/security.js";
import publicRouter from "./routes/inicio_router.js";
import adminRouter from "./routes/admin_router.js";
import { catalogoBoletos, formatMoney } from "./data/boletos.js";
// Devuelve la aplicación lista para usarse. El puerto se abre en index.js, para que las
// pruebas puedan usar esta misma aplicación.
export function createApp() {
  const app = express();
// Estas variables están disponibles en todas las vistas EJS: boletos y una función para
// escribir precios en pesos.
  app.locals.catalogoBoletos = catalogoBoletos;
  app.locals.formatMoney = formatMoney;
  app.disable("x-powered-by");
// En producción puede haber un proxy delante del servidor. Sólo confiamos en él cuando se
// configura expresamente.
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);
// EJS convierte las plantillas de views en HTML usando los datos que entrega el
// controlador.
  app.set("view engine", "ejs");
  app.set("views", path.join(projectRoot, "views"));
// Helmet agrega encabezados de protección. La página carga sus scripts, imágenes y estilos
// desde este mismo sitio.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'"],
          "style-src": ["'self'"],
          "img-src": ["'self'"],
          "upgrade-insecure-requests": config.production ? [] : null,
        },
      },
      strictTransportSecurity: config.production ? undefined : false,
    }),
  );
// Esta ruta comprueba que MariaDB responda. Docker la usa para saber si la aplicación está
// funcionando.
  app.get("/health", async (req, res) => {
    try {
      await db.authenticate();
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
// Los archivos de public se pueden descargar desde el navegador. El resto del proyecto no
// se publica como archivos estáticos.
  app.use(
    express.static(path.join(projectRoot, "public"), {
      index: false,
      maxAge: config.production ? "1d" : 0,
    }),
  );
// Bootstrap se entrega desde la instalación local, sin depender de una CDN externa.
  app.use(
    "/vendor/bootstrap",
    express.static(path.join(projectRoot, "node_modules/bootstrap/dist"), {
      maxAge: "7d",
    }),
  );
// Lee los campos de formularios y los cuerpos JSON. El tamaño permitido limita envíos
// demasiado grandes.
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use(express.json({ limit: "16kb" }));
// Un formulario HTML envía POST; _method permite interpretarlo como PUT o DELETE para el
// CRUD.
  app.use(methodOverride("_method", { methods: ["POST"] }));
// La cookie identifica la sesión; sus datos se guardan en MariaDB. Así el administrador
// conserva su acceso entre peticiones.
  app.use(
    session({
      name: "semana.sid",
      secret: config.secret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.production,
        maxAge: 1000 * 60 * 60 * 8,
      },
    }),
  );
// Prepara datos comunes para las vistas: página actual, avisos y fechas. Los avisos se
// muestran una sola vez.
  app.use((req, res, next) => {
// El HTML con formularios y sesión no debe reutilizarse desde una caché compartida.
    res.set("Cache-Control", "no-store");
    res.locals.path = req.path;
    res.locals.description =
      "Elige tus conferencias y agrega boletos al carrito. Semana de Ingeniería 2027-1 en la FES Aragón, UNAM.";
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    res.locals.admin = Boolean(req.session.adminId);
    res.locals.formatDate = (value) =>
      value
        ? new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "America/Mexico_City",
          }).format(new Date(`${value}T12:00:00Z`))
        : "Semana de Ingeniería 2027-1";
    res.locals.formatCommentDate = (value) =>
      new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "America/Mexico_City",
      }).format(value);
    next();
  });
// Antes de entrar a las rutas, comprueba el token que protege los formularios contra
// envíos de otros sitios.
  app.use(csrf);
// Las rutas públicas muestran conferencias. Las de /admin tienen su propio control de
// acceso.
  app.use("/", publicRouter);
  app.use("/admin", adminRouter);
// Si ninguna ruta respondió, devuelve un 404 en HTML o JSON según la petición.
  app.use((req, res) => {
    if (wantsJson(req) || req.path.startsWith("/api/"))
      return res.status(404).json({ mensaje: "No se encontró el recurso." });
    res
      .status(404)
      .render("error", {
        title: "Página no encontrada",
        status: 404,
        message:
          "La página que buscas no está disponible. Puedes volver a explorar las conferencias.",
      });
  });
// Recoge los errores que llegan desde las rutas y muestra un mensaje general, sin revelar
// detalles internos.
  app.use((error, req, res, next) => {
    console.error("Error en la solicitud:", error.name);
    if (res.headersSent) return next(error);
    const status =
      error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
    const message =
      status === 413
        ? "El envío supera el tamaño permitido."
        : status === 400
          ? "La solicitud no tiene un formato válido."
          : "No pudimos completar la solicitud. Inténtalo de nuevo más tarde.";
    if (wantsJson(req) || req.path.startsWith("/api/"))
      return res.status(status).json({ mensaje: message });
    res
      .status(status)
      .render("error", { title: "Ocurrió un problema", status, message });
  });
  return app;
}
