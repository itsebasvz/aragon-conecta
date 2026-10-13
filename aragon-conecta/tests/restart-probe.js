// Proceso auxiliar que comprueba persistencia. Abre otra instancia de Express para
// verificar que el comentario y la sesión siguen en MariaDB.
import "./env.js";
import assert from "node:assert/strict";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { Comentario } from "../models/index.js";
import { sessionStore } from "../config/session.js";
// El puerto cero pide al sistema un puerto libre; la prueba no depende de un número fijo.
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
try {
// Reutiliza una cookie de prueba y consulta el panel sin seguir redirecciones; una sesión
// perdida se detectaría como redirección al acceso.
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/admin`,
    {
      redirect: "manual",
      headers: { cookie: process.env.TEST_SESSION_COOKIE },
    },
  );
  assert.equal(
    response.status,
    200,
    "La sesión debe sobrevivir en un proceso nuevo.",
  );
// También busca el comentario que guardó el proceso anterior: ambos procesos deben ver el
// mismo registro.
  assert.ok(
    await Comentario.findByPk(process.env.TEST_COMMENT_ID),
    "El comentario debe seguir guardado.",
  );
// Siempre cierra los recursos, incluso si una comprobación falla.
} finally {
  await new Promise((resolve) => server.close(resolve));
  sessionStore.stopExpiringSessions();
  await db.close();
}
