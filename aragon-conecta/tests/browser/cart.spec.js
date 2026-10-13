// Prueba el carrito y el pago ficticio desde el navegador. Cada caso comienza en un
// contexto limpio; algunas pruebas abren otra pestaña para comprobar sincronización.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Estos identificadores corresponden a las conferencias y a la clave real del carrito; los
// helpers acortan los pasos de las pruebas.
const key = "aragon-conecta:carrito:v1";
const aws = "infraestructura-del-manana";
const omar = "sostenibilidad-de-los-datos";
const hello = "hello-world";
const add = (page, slug) => page.locator(`[data-add-ticket="${slug}"]`).click();
const open = (page) => page.locator("[data-cart-toggle]").click();
const dialog = (page) => page.locator("[data-cart-dialog]");
const row = (page, slug) => page.locator(`[data-cart-item="${slug}"]`);
const total = (page) => page.locator("[data-cart-total]");

// Agrega boletos desde varias páginas y revisa cantidades, total, persistencia y vaciado.
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
  await expect(dialog(page).getByRole("button", { name: "Continuar al pago" })).toBeDisabled();
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), key)).toBe("[]");
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator("[data-cart-toggle]")).toBeFocused();
});

// Registra las peticiones de escritura: el pago ficticio no debe enviar un cargo ni un
// pedido al servidor.
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
  await dialog(page).getByRole("button", { name: "Continuar al pago" }).click();
  await page.locator("[data-payment-confirm]").click();
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

// Coloca datos dañados o manipulados en localStorage y verifica que el carrito use el
// catálogo de precios vigente.
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

// Prueba los extremos: no se puede bajar de un boleto ni superar noventa y nueve por
// conferencia.
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

// Hace que el almacenamiento arroje errores para comprobar la alternativa en memoria.
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
  await dialog(page).getByRole("button", { name: "Continuar al pago" }).click();
  await page.locator("[data-payment-confirm]").click();
  await expect(page.locator("[data-cart-receipt-total]")).toHaveText("$100.00 MXN");
  expect(errors).toEqual([]);
});

// Recorre selección, pago y confirmación en distintos tamaños; revisa el foco, los bordes
// de pantalla y la accesibilidad.
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
    await dialog(page).getByRole("button", { name: "Continuar al pago" }).click();
    await expect(page.getByRole("heading", { name: "Elige cómo quieres pagar" })).toBeFocused();
    await expect(page.locator("[data-cart-count]")).toHaveText("2");
    expect(await dialog(page).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const footer = page.locator(".payment-footer");
    expect(await footer.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const payBounds = await page.locator("[data-payment-confirm]").boundingBox();
    expect(payBounds.y + payBounds.height).toBeLessThanOrEqual(800);
    expect(payBounds.x + payBounds.width).toBeLessThanOrEqual(width);
    const paymentResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(paymentResults.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })), `pago ${width}px`).toEqual([]);
    await page.screenshot({ path: `/tmp/aragon-pago-${width}.png` });
    await page.locator("[data-payment-confirm]").click();
    await expect(page.getByRole("heading", { name: "¡Compra simulada completada!" })).toBeVisible();
    expect(await dialog(page).evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    const completeResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(completeResults.violations.map((v) => v.id), `confirmación ${width}px`).toEqual([]);
    await page.keyboard.press("Escape");
  }
});

// Dos pestañas del mismo contexto comparten localStorage; el contador debe reflejar los
// cambios de ambas.
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

// Prueba los tres métodos, las imágenes locales y el resumen sin pedir datos bancarios
// reales.
test("permite elegir Visa, Mastercard y PayPal con datos ficticios y recursos locales", async ({ page }) => {
  const external = [];
  const errors = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:2810")) external.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const method of ["visa", "mastercard", "paypal"]) {
    await page.goto("/");
    await add(page, hello);
    await open(page);
    await page.getByRole("button", { name: "Continuar al pago" }).click();
    await page.locator(`[name="metodo-pago"][value="${method}"]`).check();
    await expect(page.locator("[data-payment-total]")).toHaveText("$100.00 MXN");
    if (method === "paypal") {
      await expect(page.locator("[data-payment-paypal]")).toContainText("demo@aragon.example");
      await expect(page.locator("[data-payment-card]")).toBeHidden();
    } else {
      await expect(page.locator("[data-payment-card]")).toBeVisible();
      await expect(page.locator("[data-payment-number]")).toContainText(method === "visa" ? "4242" : "4444");
      await expect(page.locator("[data-payment-paypal]")).toBeHidden();
    }
    expect(await page.locator("[data-payment-screen] input:not([type=radio])").count()).toBe(0);
    await expect.poll(() => page.locator("[data-payment-screen] img").evaluateAll((images) => images.filter(img => !img.complete || !img.naturalWidth).map(img => img.src))).toEqual([]);
    await page.locator("[data-payment-confirm]").click();
    await expect(page.locator("[data-payment-confirm]")).toBeDisabled();
    await expect(page.locator("[data-payment-confirm]")).toHaveAttribute("aria-busy", "true");
    await expect(page.getByRole("heading", { name: "¡Compra simulada completada!" })).toBeVisible();
    await expect(page.locator("[data-payment-receipt-method]")).toContainText(method === "paypal" ? "PayPal" : method === "visa" ? "Visa" : "Mastercard");
    expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe("[]");
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

// Cerrar durante la espera del pago debe cancelar la confirmación y conservar los boletos.
test("volver o cerrar el pago conserva el carrito y actualiza su resumen", async ({ page }) => {
  await page.goto("/");
  await add(page, aws);
  await add(page, hello);
  await open(page);
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await page.getByRole("radio", { name: /Mastercard/ }).check();
  await page.getByRole("button", { name: "Volver al carrito" }).click();
  await expect(page.getByRole("button", { name: "Continuar al pago" })).toBeFocused();
  await row(page, aws).getByRole("button", { name: /Sumar/ }).click();
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  await expect(page.locator("[data-payment-total]")).toHaveText("$600.00 MXN");
  await page.locator("[data-payment-confirm]").click();
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await page.waitForTimeout(850);
  await expect(page.locator("[data-cart-count]")).toHaveText("3");
  await open(page);
  await expect(total(page)).toHaveText("$600.00 MXN");
  await expect(page.locator("[data-cart-complete]")).toBeHidden();
});

// Si otra pestaña cambia la selección, el resumen de pago se actualiza antes de confirmar.
test("revisa el carrito si cambia en otra pestaña durante el pago", async ({ page, context }) => {
  await page.goto("/");
  await add(page, hello);
  await open(page);
  await page.getByRole("button", { name: "Continuar al pago" }).click();
  const other = await context.newPage();
  await other.goto("/conferencias");
  await add(other, aws);
  await expect(page.locator("[data-payment-total]")).toHaveText("$350.00 MXN");
  await expect(page.locator("[data-cart-dialog-live]")).toContainText("cambió en otra pestaña");
  await open(other);
  await other.getByRole("button", { name: "Vaciar carrito" }).click();
  await expect(page.locator("[data-payment-screen]")).toBeHidden();
  await expect(page.locator("[data-cart-empty]")).toBeVisible();
  await other.close();
});
