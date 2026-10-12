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
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", config.trustProxy);
  app.set("view engine", "ejs");
  app.set("views", path.join(projectRoot, "views"));
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
  app.get("/health", async (req, res) => {
    try {
      await db.authenticate();
      res.json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });
  app.use(
    express.static(path.join(projectRoot, "public"), {
      index: false,
      maxAge: config.production ? "1d" : 0,
    }),
  );
  app.use(
    "/vendor/bootstrap",
    express.static(path.join(projectRoot, "node_modules/bootstrap/dist"), {
      maxAge: "7d",
    }),
  );
  app.use(express.urlencoded({ extended: false, limit: "16kb" }));
  app.use(express.json({ limit: "16kb" }));
  app.use(methodOverride("_method", { methods: ["POST"] }));
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
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.locals.path = req.path;
    res.locals.description =
      "Conferencias, ideas y comunidad de la Semana de Ingeniería 2027-1 en la FES Aragón, UNAM.";
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
  app.use(csrf);
  app.use("/", publicRouter);
  app.use("/admin", adminRouter);
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
