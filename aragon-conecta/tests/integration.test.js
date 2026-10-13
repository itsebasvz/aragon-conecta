// Pruebas del servidor con una base de datos aislada. Supertest simula peticiones HTTP y
// assert comprueba que las respuestas y los datos sean los esperados.
import "./env.js";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../app.js";
import { db } from "../config/db.js";
import { sessionStore } from "../config/session.js";
import { Conferencia, Comentario, Administrador } from "../models/index.js";
import { conferencias } from "../data/conferencias.js";

const exec = promisify(execFile);
const app = createApp();
const slug = "infraestructura-del-manana";
// Extrae el token del formulario renderizado, igual que lo recibiría un navegador.
const tokenFrom = (html) => html.match(/name="_csrf" value="([^"]+)"/)?.[1];
// Cada agente conserva sus cookies entre peticiones. Visitante y administrador usan
// sesiones distintas.
const visitor = request.agent(app);
const admin = request.agent(app);
let token;
let adminToken;
let commentId;
let adminCookie;
// Antes de los casos, crea desde cero sólo las tablas de la base _test y carga datos
// conocidos.
before(async () => {
  await db.authenticate();
  await db.sync({ force: true }); // Exclusivamente en la base aislada terminada en _test.
  await Conferencia.bulkCreate(conferencias);
  await Administrador.create({
    email: process.env.ADMIN_EMAIL,
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
  });
});
// Al terminar, cierra la tarea de sesiones y la conexión para no dejar procesos
// pendientes.
after(async () => {
  sessionStore.stopExpiringSessions();
  await db.close();
});

// Primero comprueba que las páginas y los recursos locales puedan consultarse sin errores.
test("renderiza todas las páginas y los recursos locales", async () => {
  for (const url of [
    "/",
    "/conferencias",
    "/acerca",
    "/privacidad",
    "/admin/login",
    "/conferencias/hello-world/materiales",
    ...conferencias.map((c) => `/conferencias/${c.slug}`),
  ]) {
    const res = await request(app).get(url).expect(200);
    assert.match(res.text, /lang="es-MX"/);
    assert.match(res.text, /<h1/);
    assert.equal((res.text.match(/<h1\b/g) || []).length, 1);
  }
  for (const url of [
    "/css/sitio.css",
    "/js/sitio.js",
    "/vendor/bootstrap/css/bootstrap.min.css",
    "/media/logo-unam.svg",
    "/media/campus.webp",
    "/fonts/poppins-latin-400-normal.woff2",
  ])
    await request(app).get(url).expect(200);
  await request(app).get("/health").expect(200, { status: "ok" });
});

test("la API solo expone datos públicos y conserva la información confirmada", async () => {
  const { body } = await request(app).get("/api/conferencias").expect(200);
  assert.equal(body.length, 3);
  assert.equal(body[0].sede, "Auditorio del DUACyD");
  assert.equal(body[0].horario, "17:00–18:30 h");
  assert.equal(body[1].fecha, null);
  assert.ok(body.every((c) => !("passwordHash" in c)));
  await request(app)
    .get("/api/conferencias/inexistente/comentarios")
    .expect(404);
  await request(app).get("/conferencias/inexistente").expect(404);
  await request(app).get("/galeria").expect(404);
  await request(app).get("/docs/CRUD_Persona.pdf").expect(404);
});

// El catálogo que recibe el navegador debe mostrar los mismos precios que las páginas de
// detalle.
test("ofrece boletos de demostración con precios iguales en catálogo y detalle", async () => {
  const page = await request(app).get("/conferencias").expect(200);
  const escaped = page.text.match(/data-cart-catalog="([^"]+)"/)[1];
  const catalog = JSON.parse(escaped.replaceAll("&#34;", '"').replaceAll("&quot;", '"'));
  assert.deepEqual(catalog.map((c) => c.precioCentavos), [25000, 15000, 10000]);
  for (const [slug, price] of [["infraestructura-del-manana", "250.00"], ["sostenibilidad-de-los-datos", "150.00"], ["hello-world", "100.00"]]) {
    const detail = await request(app).get(`/conferencias/${slug}`).expect(200);
    assert.ok(page.text.includes(`$${price}`));
    assert.ok(detail.text.includes(`$${price}`));
    assert.ok(detail.text.includes(`data-add-ticket="${slug}"`));
    assert.match(detail.text, /Fechas y materiales del evento original/);
  }
  await request(app).get("/js/carrito.js").expect(200);
  assert.equal(await Comentario.count(), 0);
});

// Intenta enviar formularios sin un token correcto y verifica que no se creen comentarios.
test("rechaza CSRF ausente, inválido y unicode sin producir un error de servidor", async () => {
  const page = await visitor.get(`/conferencias/${slug}`).expect(200);
  token = tokenFrom(page.text);
  assert.ok(token);
  assert.match(page.headers["set-cookie"][0], /HttpOnly/);
  assert.match(page.headers["set-cookie"][0], /SameSite=Lax/);
  for (const _csrf of [undefined, "a".repeat(64), "é".repeat(64)]) {
    await visitor
      .post(`/conferencias/${slug}/comentarios`)
      .send({
        _csrf,
        nombre: "Visitante",
        mensaje: "Una reflexión sobre los datos.",
        acepto: "si",
      })
      .expect(403);
  }
  assert.equal(await Comentario.count(), 0);
});

test("valida contenido y consentimiento en servidor", async () => {
  const res = await visitor
    .post(`/conferencias/${slug}/comentarios`)
    .send({ _csrf: token, nombre: "a", mensaje: "corto" })
    .expect(400);
  assert.ok(res.body.errors.nombre);
  assert.ok(res.body.errors.mensaje);
  assert.ok(res.body.errors.acepto);
  assert.equal(await Comentario.count(), 0);
});

// Comprueba que un visitante no pueda elegir aprobado enviando campos extra.
test("crea un comentario pendiente y no permite asignar un estado público", async () => {
  const payload = {
    _csrf: token,
    nombre: "Estudiante",
    mensaje:
      '<script>alert("xss")</script> Me interesa el desarrollo con especificaciones.',
    acepto: "si",
    estado: "aprobado",
  };
  await visitor
    .post(`/conferencias/${slug}/comentarios`)
    .send(payload)
    .expect(201);
  const saved = await Comentario.findOne();
  assert.equal(saved.estado, "pendiente");
  commentId = saved.id;
  assert.equal(
    (await visitor.get(`/api/conferencias/${slug}/comentarios`)).body.length,
    0,
  );
  assert.doesNotMatch(
    (await visitor.get(`/conferencias/${slug}`)).text,
    /Me interesa el desarrollo/,
  );
});

test("ofrece envío HTML sin JavaScript y conserva valores tras errores", async () => {
  const bad = await visitor
    .post("/conferencias/hello-world/comentarios")
    .type("form")
    .send({
      _csrf: token,
      nombre: "Estudiante HTML",
      mensaje: "corto",
      acepto: "si",
    })
    .expect(400);
  assert.match(bad.text, /value="Estudiante HTML"/);
  assert.match(bad.text, /aria-invalid="true"/);
  await visitor
    .post("/conferencias/hello-world/comentarios")
    .type("form")
    .send({
      _csrf: token,
      nombre: "Estudiante HTML",
      mensaje: "Me gustaría colaborar en proyectos del club.",
      acepto: "si",
    })
    .expect(303);
});

test("protege el panel y las operaciones de moderación", async () => {
  await request(app)
    .get("/admin")
    .expect(302)
    .expect("Location", "/admin/login");
  await visitor
    .post(`/admin/comentarios/${commentId}?_method=PUT`)
    .send({ _csrf: token, estado: "aprobado" })
    .expect(401);
  assert.equal((await Comentario.findByPk(commentId)).estado, "pendiente");
});

// Prueba el acceso con contraseña, la renovación de la cookie y el cambio de estado desde
// una sesión administrativa.
test("autentica con bcrypt, renueva la sesión y permite moderar", async () => {
  const loginPage = await admin.get("/admin/login").expect(200);
  const loginToken = tokenFrom(loginPage.text);
  await admin
    .post("/admin/login")
    .type("form")
    .send({
      _csrf: loginToken,
      email: process.env.ADMIN_EMAIL,
      password: "incorrecta",
    })
    .expect(401);
  const signedIn = await admin
    .post("/admin/login")
    .type("form")
    .send({
      _csrf: loginToken,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })
    .expect(303);
  adminCookie = signedIn.headers["set-cookie"][0].split(";")[0];
  assert.notEqual(
    signedIn.headers["set-cookie"][0].split(";")[0],
    loginPage.headers["set-cookie"][0].split(";")[0],
  );
  const panel = await admin.get("/admin").expect(200);
  adminToken = tokenFrom(panel.text);
  assert.match(panel.text, /&lt;script&gt;/);
  await admin
    .post(`/admin/comentarios/${commentId}?_method=PUT`)
    .type("form")
    .send({ _csrf: adminToken, estado: "aprobado", nombre: "Cambiar autor" })
    .expect(303);
  const saved = await Comentario.findByPk(commentId);
  assert.equal(saved.estado, "aprobado");
  assert.equal(saved.nombre, "Estudiante");
  const page = await visitor.get(`/conferencias/${slug}`).expect(200);
  assert.match(page.text, /&lt;script&gt;alert/);
  assert.doesNotMatch(page.text, /<script>alert/);
  assert.equal(
    (await visitor.get(`/api/conferencias/${slug}/comentarios`)).body.length,
    1,
  );
});

test("filtra, valida el estado y oculta los comentarios rechazados", async () => {
  await admin
    .get("/admin?estado=aprobado&conferencia=infraestructura-del-manana")
    .expect(200);
  await admin
    .post(`/admin/comentarios/${commentId}?_method=PUT`)
    .type("form")
    .send({ _csrf: adminToken, estado: "otro" })
    .expect(400);
  await admin
    .post(`/admin/comentarios/${commentId}?_method=PUT`)
    .type("form")
    .send({ _csrf: adminToken, estado: "rechazado" })
    .expect(303);
  assert.equal(
    (await visitor.get(`/api/conferencias/${slug}/comentarios`)).body.length,
    0,
  );
  await admin
    .post("/admin/comentarios/999999?_method=PUT")
    .type("form")
    .send({ _csrf: adminToken, estado: "aprobado" })
    .expect(404);
});

// Los filtros deben conservarse al moderar, pero no se debe permitir volver a una URL
// externa.
test("busca comentarios y conserva filtros sin permitir redirecciones externas", async () => {
  const found = await admin.get("/admin?q=Estudiante&estado=rechazado").expect(200);
  assert.match(found.text, /action="\/admin\/comentarios\/\d+\?_method=PUT"/);
  assert.match(found.text, /aria-label="Rechazados: [1-9]/);
  const empty = await admin.get("/admin?q=NoExisteEstaReflexion").expect(200);
  assert.match(empty.text, /Sin resultados en esta selección/);
  for (const [volver, expected] of [
    ["https://example.com/", "/admin#moderacion-feedback"],
    ["//example.com/admin", "/admin#moderacion-feedback"],
    ["/admin?estado=rechazado&q=Estudiante", "/admin?estado=rechazado&q=Estudiante#moderacion-feedback"],
  ]) {
    const response = await admin.post(`/admin/comentarios/${commentId}?_method=PUT`)
      .type("form").send({ _csrf: adminToken, estado: "rechazado", volver }).expect(303);
    assert.equal(response.headers.location, expected);
  }
});

// Crea suficientes datos para paginar y comprueba el regreso a una página válida después
// de eliminar.
test("ajusta la última página cuando se elimina su último comentario", async () => {
  const created = await Comentario.bulkCreate(Array.from({ length: 21 }, (_, i) => ({
    conferenciaId: 1, nombre: `Paginación UX ${i}`, mensaje: "Una reflexión para verificar la navegación entre páginas.",
  })));
  const ids = created.map(c => c.id);
  try {
    const response = await admin.get("/admin?q=Paginación%20UX&pagina=2").expect(200);
    assert.equal((response.text.match(/class="moderation-card"/g) || []).length, 1);
    const id = Number(response.text.match(/action="\/admin\/comentarios\/(\d+)\?_method=PUT"/)[1]);
    await Comentario.destroy({ where: { id } });
    const adjusted = await admin.get("/admin?q=Paginación%20UX&pagina=2").expect(200);
    assert.equal((adjusted.text.match(/class="moderation-card"/g) || []).length, 20);
  } finally {
    await Comentario.destroy({ where: { id: ids } });
  }
});

// Repetir el seed no debe duplicar conferencias ni reemplazar los comentarios que ya
// existen.
test("la carga inicial es idempotente y conserva comentarios existentes", async () => {
  const count = await Comentario.count();
  for (let i = 0; i < 2; i++)
    await exec(process.execPath, ["scripts/db-seed.js"], {
      cwd: new URL("../", import.meta.url),
      env: process.env,
    });
  assert.equal(await Conferencia.count(), 3);
  assert.equal(await Administrador.count(), 1);
  assert.equal(await Comentario.count(), count);
});

// Ejecuta un proceso separado para demostrar que los datos no viven sólo en la memoria de
// este servidor.
test("conserva comentarios y sesiones en un proceso nuevo", async () => {
  await exec(process.execPath, ["tests/restart-probe.js"], {
    cwd: new URL("../", import.meta.url),
    env: {
      ...process.env,
      TEST_SESSION_COOKIE: adminCookie,
      TEST_COMMENT_ID: String(commentId),
    },
  });
});

test("exige confirmación para eliminar y permite cerrar sesión", async () => {
  await admin
    .post(`/admin/comentarios/${commentId}?_method=DELETE`)
    .type("form")
    .send({ _csrf: adminToken })
    .expect(400);
  await admin
    .post(`/admin/comentarios/${commentId}?_method=DELETE`)
    .type("form")
    .send({ _csrf: adminToken, confirmar: "eliminar" })
    .expect(303);
  assert.equal(await Comentario.findByPk(commentId), null);
  await admin
    .post("/admin/logout")
    .type("form")
    .send({ _csrf: adminToken })
    .expect(303);
  await admin.get("/admin").expect(302);
});

test("limita los envíos repetidos de comentarios", async () => {
  let limited = false;
  for (let i = 0; i < 11; i++) {
    const res = await visitor.post(`/conferencias/${slug}/comentarios`).send({
      _csrf: token,
      nombre: "Visitante",
      mensaje: "Una reflexión para comprobar el límite.",
      acepto: "si",
    });
    if (res.status === 429) {
      limited = true;
      break;
    }
  }
  assert.ok(limited);
});

// Cambiar la contraseña debe permitir el nuevo acceso y dejar inválidas las sesiones
// anteriores de ese administrador.
test("rota la contraseña y revoca sesiones existentes de administración", async () => {
  const actor = request.agent(app);
  const loginPage = await actor.get("/admin/login");
  await actor
    .post("/admin/login")
    .type("form")
    .send({
      _csrf: tokenFrom(loginPage.text),
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    })
    .expect(303);
  const changedPassword = "Nueva-clave-de-pruebas-2027";
  await exec(process.execPath, ["scripts/admin-password.js"], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, ADMIN_PASSWORD: changedPassword },
  });
  assert.ok(
    await bcrypt.compare(
      changedPassword,
      (await Administrador.findOne()).passwordHash,
    ),
  );
  await actor.get("/admin").expect(302);
  await exec(process.execPath, ["scripts/admin-password.js"], {
    cwd: new URL("../", import.meta.url),
    env: process.env,
  });
});

// Comprueba que entradas malformadas y cuerpos grandes se rechacen sin dejar caer el
// servidor.
test("rechaza JSON malformado, cuerpos excesivos y rutas de método inválido", async () => {
  await request(app)
    .post(`/conferencias/${slug}/comentarios`)
    .set("Content-Type", "application/json")
    .send("{")
    .expect(400);
  await request(app)
    .post(`/conferencias/${slug}/comentarios`)
    .send({ mensaje: "a".repeat(17000) })
    .expect(413);
  await request(app).get("/admin/comentarios/1?_method=DELETE").expect(302);
  assert.ok((await Comentario.count()) > 0);
  await request(app).get("/.env").expect(404);
});

// Verifica que los intentos fallidos repetidos terminen recibiendo el límite de acceso.
test("limita los intentos fallidos de inicio de sesión", async () => {
  const actor = request.agent(app);
  const loginPage = await actor.get("/admin/login");
  let limited = false;
  for (let i = 0; i < 11; i++) {
    const res = await actor
      .post("/admin/login")
      .type("form")
      .send({
        _csrf: tokenFrom(loginPage.text),
        email: process.env.ADMIN_EMAIL,
        password: "incorrecta",
      });
    if (res.status === 429) {
      limited = true;
      break;
    }
  }
  assert.ok(limited);
});
