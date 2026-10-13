// Comprueba el problema de lectura en laptop y que la corrección no cambie la letra móvil.
import { test, expect } from "@playwright/test";

test("texto cómodo en escritorio y escala móvil conservada", async ({ page }) => {
  for (const width of [360, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const styles = await page.evaluate(() => {
      const selectors = ["body", ".event-card-body > p", ".card-meta", ".ticket-add"];
      const sizes = () => selectors.map((selector) => parseFloat(getComputedStyle(document.querySelector(selector)).fontSize));
      const current = sizes();
      const sheet = document.querySelector('link[href="/css/lectura.css"]').sheet;
      sheet.disabled = true;
      const original = sizes();
      sheet.disabled = false;
      return { current, original, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    expect(styles.overflow, `${width}px`).toBe(false);
    if (width < 1024) {
      expect(styles.current, `Móvil y tableta a ${width}px`).toEqual(styles.original);
    } else {
      const [body, description, metadata, button] = styles.current;
      expect(body).toBeGreaterThanOrEqual(18);
      expect(description).toBeGreaterThanOrEqual(16);
      expect(metadata).toBeGreaterThanOrEqual(14);
      expect(button).toBeGreaterThanOrEqual(16);
    }
  }
});

// Se amplía sólo el texto y se aplican preferencias de espaciado para detectar recortes.
// bypassCSP permite inyectar estos estilos de prueba, sin cambiar la política del servidor.
test("lectura ampliada al 200 por ciento y pago en ventana baja sin recortes", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  const page = await context.newPage();
  try {
    for (const path of ["/", "/conferencias/hello-world", "/acerca", "/admin/login"]) {
      await page.goto(`http://127.0.0.1:2810${path}`);
      await page.addStyleTag({ content: `html { font-size: 200%; }
        p, li, label, a, button, dt, dd, small, strong { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
        p { margin-bottom: 2em !important; }` });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true);
      const clipped = await page.locator(".event-card-body, .comment-form, .sidebar-panel, .login-form").evaluateAll((nodes) =>
        nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.className));
      expect(clipped, path).toEqual([]);
    }
    await page.goto("http://127.0.0.1:2810/");
    await page.setViewportSize({ width: 1024, height: 500 });
    await page.locator('[data-add-ticket="hello-world"]').click();
    await page.locator("[data-cart-toggle]").click();
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    const dialog = page.locator("[data-cart-dialog]");
    expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.getByRole("radio", { name: /PayPal/ }).check();
    // Playwright desplaza el panel hasta el botón: debe seguir siendo alcanzable.
    await page.locator("[data-payment-confirm]").click();
    await expect(page.getByRole("heading", { name: "¡Compra simulada completada!" })).toBeVisible();
  } finally {
    await context.close();
  }
});
