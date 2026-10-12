import "./env.js";
import assert from "node:assert/strict";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { Comentario } from "../models/index.js";
import { sessionStore } from "../config/session.js";
const server = createApp().listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
try {
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
  assert.ok(
    await Comentario.findByPk(process.env.TEST_COMMENT_ID),
    "El comentario debe seguir guardado.",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
  sessionStore.stopExpiringSessions();
  await db.close();
}
