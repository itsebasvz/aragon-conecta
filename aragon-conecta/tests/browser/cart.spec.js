import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const key = "aragon-conecta:carrito:v1";
const aws = "infraestructura-del-manana";
const omar = "sostenibilidad-de-los-datos";
const hello = "hello-world";
const add = (page, slug) => page.locator(`[data-add-ticket="${slug}"]`).click();
const open = (page) => page.locator("[data-cart-toggle]").click();
const dialog = (page) => page.getByRole("dialog", { name: "Tus boletos" });
const row = (page, slug) => page.locator(`[data-cart-item="${slug}"]`);
const total = (page) => page.locator("[data-cart-total]");

test("agrega desde tres páginas, persiste y permite editar, eliminar y vaciar", async ({ page }) => {
  await page.goto("/");
  await add(page, aws);
  await add(page, aws);
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator("[data-cart-count]")).toHaveText("2");
  await page.goto("/conferencias");
  await add(page, hello);
  await page.goto(`/conferencias/${omar}`);
  await add(page, omar);
  await page.reload();
  await open(page);
  await expect(row(page, aws).locator(".cart-quantity-value")).toHaveText("2");
  await expect(page.locator(".cart-item")).toHaveCount(3);
  await expect(total(page)).toHaveText("$750.00 MXN");
  await row(page, aws).getByRole("button", { name: /Sumar/ }).click();
  await expect(total(page)).toHaveText("$1,000.00 MXN");
  await expect(row(page, aws).getByRole("button", { name: /Sumar/ })).toBeFocused();
  await row(page, aws).getByRole("button", { name: /Restar/ }).click();
  await expect(total(page)).toHaveText("$750.00 MXN");
  await row(page, omar).getByRole("button", { name: /Eliminar/ }).click();
  await expect(total(page)).toHaveText("$600.00 MXN");
  await expect(page.locator("[data-cart-count]")).toHaveText("3");
  await dialog(page).getByRole("button", { name: "Vaciar carrito" }).click();
  await expect(total(page)).toHaveText("$0.00 MXN");
  await expect(page.locator("[data-cart-empty]")).toBeVisible();
  await expect(dialog(page).getByRole("button", { name: /Confirmar compra/ })).toBeDisabled();
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), key)).toBe("[]");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator("[data-cart-toggle]")).toBeFocused();
});

test("confirma una compra de demostración sin solicitudes de pago ni pedidos", async ({ page }) => {
  const writes = [];
  page.on("request", (request) => {
    if (["POST", "PUT", "DELETE"].includes(request.method())) writes.push(request.url());
  });
  await page.goto("/");
  await add(page, aws);
  await add(page, hello);
  await add(page, hello);
  await open(page);
  await expect(total(page)).toHaveText("$450.00 MXN");
  await dialog(page).getByRole("button", { name: /Confirmar compra/ }).click();
  await expect(page.getByRole("heading", { name: "¡Compra simulada completada!" })).toBeFocused();
  await expect(page.locator("[data-cart-receipt] li")).toHaveCount(2);
  await expect(page.locator("[data-cart-receipt-total]")).toHaveText("$450.00 MXN");
  await expect(page.locator("[data-cart-count]")).toHaveText("0");
  await expect(page.locator("[data-cart-complete]")).toContainText("No se realizó ningún cobro");
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), key)).toBe("[]");
  await dialog(page).getByRole("button", { name: "Seguir explorando" }).click();
  await open(page);
  await expect(page.locator("[data-cart-empty]")).toBeVisible();
  await expect(page.locator("[data-cart-complete]")).toBeHidden();
  expect(writes).toEqual([]);
});

test("recupera almacenamiento inválido y utiliza precios del catálogo vigente", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((k) => localStorage.setItem(k, "{roto"), key);
  await page.reload();
  await open(page);
  await expect(total(page)).toHaveText("$0.00 MXN");
  await page.keyboard.press("Escape");
  await page.evaluate(({ k, aws, hello }) => localStorage.setItem(k, JSON.stringify([
    { slug: "inexistente", cantidad: 1 }, { slug: hello, cantidad: "2" },
    { slug: hello, cantidad: -2 }, { slug: hello, cantidad: 100 },
    { slug: aws, cantidad: 2, precioCentavos: 1 }, { slug: aws, cantidad: 1 },
  ])), { k: key, aws, hello });
  await page.reload();
  await open(page);
  await expect(page.locator(".cart-item")).toHaveCount(1);
  await expect(total(page)).toHaveText("$750.00 MXN");
  expect(await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key))
    .toEqual([{ slug: aws, cantidad: 3 }]);
});

test("respeta las cantidades entre 1 y 99", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(({ k, aws }) => localStorage.setItem(k, JSON.stringify([{ slug: aws, cantidad: 99 }])), { k: key, aws });
  await page.reload();
  await add(page, aws);
  await expect(page.locator("[data-cart-count]")).toHaveText("99");
  await open(page);
  await expect(row(page, aws).getByRole("button", { name: /Sumar/ })).toBeDisabled();
  await row(page, aws).getByRole("button", { name: /Restar/ }).click();
  await expect(page.locator("[data-cart-count]")).toHaveText("98");
  await expect(row(page, aws).getByRole("button", { name: /Sumar/ })).toBeEnabled();
  await page.keyboard.press("Escape");
  await page.evaluate(({ k, aws }) => localStorage.setItem(k, JSON.stringify([{ slug: aws, cantidad: 1 }])), { k: key, aws });
  await page.reload();
  await open(page);
  await expect(row(page, aws).getByRole("button", { name: /Restar/ })).toBeDisabled();
});

test("permite usar el carrito aunque el navegador bloquee localStorage", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"]) {
      Storage.prototype[method] = () => { throw new DOMException("Bloqueado", "SecurityError"); };
    }
  });
  await page.goto("/");
  await add(page, hello);
  await open(page);
  await expect(total(page)).toHaveText("$100.00 MXN");
  await expect(page.locator("[data-cart-storage]")).toBeVisible();
  await dialog(page).getByRole("button", { name: /Confirmar compra/ }).click();
  await expect(page.locator("[data-cart-receipt-total]")).toHaveText("$100.00 MXN");
  expect(errors).toEqual([]);
});

test("carrito accesible y adaptable en escritorio, tableta y móvil", async ({ page }) => {
  test.setTimeout(90000);
  for (const width of [320, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await open(page);
    await expect(page.locator("[data-cart-empty]")).toBeVisible();
    await page.keyboard.press("Escape");
    await add(page, aws);
    await add(page, hello);
    await open(page);
    await expect(dialog(page)).toBeVisible();
    const bounds = await dialog(page).boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    expect(await dialog(page).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await dialog(page).getByRole("button", { name: "Cerrar carrito" }).focus();
    await page.keyboard.press("Shift+Tab");
    expect(await dialog(page).evaluate((node) => node.contains(document.activeElement))).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), `${width}px`).toEqual([]);
    await page.screenshot({ path: `/tmp/aragon-carrito-${width}.png` });
    await dialog(page).getByRole("button", { name: /Confirmar compra/ }).click();
    await expect(page.getByRole("heading", { name: "¡Compra simulada completada!" })).toBeVisible();
    expect(await dialog(page).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const completeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(completeResults.violations.map((v) => v.id), `confirmación ${width}px`).toEqual([]);
    await page.keyboard.press("Escape");
  }
});

test("cierra con el fondo exterior y sincroniza el carrito entre pestañas", async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const second = await context.newPage();
  await second.goto("/conferencias");
  await add(page, hello);
  await expect(second.locator("[data-cart-count]")).toHaveText("1");
  await open(page);
  await page.mouse.click(20, 300);
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator("[data-cart-toggle]")).toBeFocused();
  await open(second);
  await dialog(second).getByRole("button", { name: "Vaciar carrito" }).click();
  await expect(page.locator("[data-cart-count]")).toHaveText("0");
  await second.close();
});
