import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicPages = [
  "/",
  "/conferencias",
  "/conferencias/infraestructura-del-manana",
  "/conferencias/sostenibilidad-de-los-datos",
  "/conferencias/hello-world",
  "/acerca",
  "/privacidad",
  "/admin/login",
];

for (const width of [320, 360, 768, 1440]) {
  test(`páginas legibles y sin desbordamiento a ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of publicPages) {
      const response = await page.goto(path);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        path,
      ).toBe(true);
      const broken = await page
        .locator("img[src]")
        .evaluateAll((images) =>
          images
            .filter((image) => image.complete && !image.naturalWidth)
            .map((image) => image.src),
        );
      expect(broken, path).toEqual([]);
    }
    expect(errors).toEqual([]);
  });
}

test("menú móvil accesible con teclado y ampliación de fotografías", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.locator("#nav-links")).toBeHidden();
  const toggle = page.getByRole("button", { name: "Menú", exact: true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page
    .locator("#nav-links")
    .getByRole("link", { name: "Conferencias", exact: true })
    .focus();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await page.goto("/conferencias/hello-world");
  const photo = page.locator("[data-lightbox]").first();
  await photo.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(photo).toBeFocused();
});

test("carrusel con flechas, teclado y ampliación", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/conferencias/infraestructura-del-manana");
  const carousel = page.locator("[data-photo-carousel]");
  const status = carousel.locator("[data-photo-status]");
  const track = carousel.locator("[data-photo-track]");
  await carousel.scrollIntoViewIfNeeded();
  await expect(status).toHaveText("Foto 1 de 3");
  await expect(carousel.getByRole("button", { name: "Reanudar carrusel" })).toBeVisible();
  await expect(carousel.locator(".photo-thumbnail")).toHaveCount(0);
  await expect(carousel.getByRole("button", { name: "Fotografía anterior" })).toBeDisabled();
  await carousel.getByRole("button", { name: "Fotografía siguiente" }).click();
  await expect(status).toHaveText("Foto 2 de 3");
  await carousel.getByRole("button", { name: "Fotografía siguiente" }).click();
  await expect(status).toHaveText("Foto 3 de 3");
  await expect(carousel.getByRole("button", { name: "Fotografía siguiente" })).toBeDisabled();
  const photo = carousel.locator("[data-lightbox]").nth(2);
  await photo.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".dialog-image")).toHaveAttribute("alt", /EnCore/);
  await page.keyboard.press("Escape");
  await expect(photo).toBeFocused();
  await track.focus();
  await page.keyboard.press("Home");
  await expect(status).toHaveText("Foto 1 de 3");
  await page.keyboard.press("ArrowRight");
  await expect(status).toHaveText("Foto 2 de 3");
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(status).toHaveText("Foto 2 de 3");
  await track.evaluate(el => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  await expect(status).toHaveText("Foto 3 de 3");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/conferencias/hello-world");
  await expect(page.locator("[data-photo-status]")).toHaveText("Foto 1 de 2");
  await page.goto("/conferencias/sostenibilidad-de-los-datos");
  await expect(page.getByRole("heading", { name: "Así se vivió" })).toHaveCount(0);
  await expect(page.locator(".gallery-band")).toHaveCount(0);
  await expect(page.locator(".source-note")).toContainText("Fuente de la reseña");
});

test("avance automático, pausa, reanudación y vuelta al inicio", async ({ page }) => {
  test.setTimeout(45000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/conferencias/infraestructura-del-manana");
  const carousel = page.locator("[data-photo-carousel]");
  const status = carousel.locator("[data-photo-status]");
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(status).toHaveAttribute("aria-live", "off");
  await expect(status).toHaveText("Foto 2 de 3", { timeout: 9000 });
  await carousel.getByRole("button", { name: "Pausar carrusel" }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement.blur());
  await expect(status).toHaveAttribute("aria-live", "polite");
  await page.waitForTimeout(6500); // Supera el intervalo: la pausa debe persistir sin foco ni cursor.
  await expect(status).toHaveText("Foto 2 de 3");
  await carousel.getByRole("button", { name: "Reanudar carrusel" }).click();
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement.blur());
  await expect(status).toHaveText("Foto 3 de 3", { timeout: 9000 });
  await expect(status).toHaveText("Foto 1 de 3", { timeout: 9000 });
});

test("fotografías accesibles sin JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 800 } });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:2810/conferencias/infraestructura-del-manana");
  const carousel = page.locator("[data-photo-carousel]");
  await expect(carousel.locator("[data-photo-controls]")).toBeHidden();
  const last = carousel.locator("[data-lightbox]").last();
  await last.focus();
  await expect(last).toBeInViewport();
  await expect(last).toHaveAttribute("href", /aws-sebastian\.webp$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("envío progresivo, moderación, publicación y eliminación", async ({
  page,
  browser,
}) => {
  const name = `Visitante navegador ${Date.now()}`;
  await page.goto("/conferencias/hello-world");
  await page.getByLabel("Nombre visible").fill(name);
  await page
    .getByLabel("Tu reflexión")
    .fill(
      "Me gustaría colaborar en un proyecto universitario con impacto real.",
    );
  await page.locator("#acepto").check();
  await page.getByRole("button", { name: "Enviar a revisión" }).click();
  await expect(page.locator(".form-status")).toContainText(
    "después de ser revisada",
  );
  await expect(page.locator(".comment-list")).not.toContainText(name);
  await expect(page.getByLabel("Tu reflexión")).toHaveValue("");
  const admin = await browser.newPage();
  await admin.goto("/admin/login");
  await admin.getByLabel("Correo electrónico").fill("admin@pruebas.local");
  await admin.getByLabel("Contraseña").fill("Pruebas-locales-2027-1");
  await admin.getByRole("button", { name: "Entrar a administración" }).click();
  await expect(
    admin.getByRole("heading", { name: "Moderación de comentarios" }),
  ).toBeVisible();
  let card = admin.locator(".moderation-card").filter({ hasText: name });
  await card.locator("select").selectOption("aprobado");
  await card.getByRole("button", { name: "Guardar estado" }).click();
  await page.reload();
  await expect(page.locator(".comment-list")).toContainText(name);
  card = admin.locator(".moderation-card").filter({ hasText: name });
  await card.locator("summary").click();
  await card.getByRole("checkbox").check();
  await card.getByRole("button", { name: "Eliminar definitivamente" }).click();
  await page.reload();
  await expect(page.locator(".comment-list")).not.toContainText(name);
  await admin.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(admin).toHaveURL(/\/admin\/login$/);
  await admin.close();
});

test("formularios y navegación funcionan sin JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  await page.goto(
    "http://127.0.0.1:2810/conferencias/sostenibilidad-de-los-datos",
  );
  await expect(page.locator("#nav-links")).toBeVisible();
  await page.getByLabel("Nombre visible").fill("Visitante sin JavaScript");
  await page
    .getByLabel("Tu reflexión")
    .fill(
      "La documentación permite dar continuidad al conocimiento compartido.",
    );
  await page.locator("#acepto").check();
  await page.getByRole("button", { name: "Enviar a revisión" }).click();
  await expect(page.getByRole("status")).toContainText(
    "después de ser revisada",
  );
  await context.close();
});

test("recursos locales, movimiento reducido y capturas de revisión", async ({
  page,
}) => {
  const external = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("http://127.0.0.1:2810"))
      external.push(req.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  await page.screenshot({
    path: "/tmp/semanaing-escritorio.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: "/tmp/semanaing-movil.png", fullPage: true });
});

test("accesibilidad automática WCAG AA en páginas públicas", async ({
  page,
}) => {
  for (const path of [
    "/",
    "/conferencias/hello-world",
    "/acerca",
    "/admin/login",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
      path,
    ).toEqual([]);
  }
});
