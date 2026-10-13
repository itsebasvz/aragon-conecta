// Controla el carrito y el pago ficticio en el navegador. Sólo guarda slugs y cantidades;
// no envía pagos ni crea pedidos en el servidor.
// Esta función se ejecuta al cargar el archivo. Mantiene sus variables dentro del carrito
// para no mezclarlas con otros scripts.
(() => {
  const dialog = document.querySelector("[data-cart-dialog]");
  const toggle = document.querySelector("[data-cart-toggle]");
  if (!dialog || !toggle || typeof dialog.showModal !== "function") return;

// EJS dejó el catálogo en un atributo data-cart-catalog. Map permite encontrar una
// conferencia rápidamente usando su slug.
  const catalog = new Map(JSON.parse(dialog.dataset.cartCatalog).map((item) => [item.slug, item]));
// La clave identifica este carrito en localStorage. El límite se aplica a cada
// conferencia, no al total de boletos.
  const storageKey = "aragon-conecta:carrito:v1";
  const maxQuantity = 99;
  const money = (cents) => new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN",
  }).format(cents / 100);
  const unitsLabel = (quantity) => `${quantity} ${quantity === 1 ? "boleto" : "boletos"}`;
// Busca las partes de la ventana que se actualizarán: lista, botones y pantallas de
// carrito, pago y confirmación.
  const items = dialog.querySelector("[data-cart-items]");
  const checkout = dialog.querySelector("[data-cart-checkout]");
  const clear = dialog.querySelector("[data-cart-clear]");
  const shopping = dialog.querySelector("[data-cart-shopping]");
  const complete = dialog.querySelector("[data-cart-complete]");
  const payment = dialog.querySelector("[data-payment-screen]");
  const paymentConfirm = dialog.querySelector("[data-payment-confirm]");
  const paymentBack = dialog.querySelector("[data-payment-back]");
  const paymentRadios = [...payment.querySelectorAll('[name="metodo-pago"]')];
// Estos datos son ficticios y sólo se muestran en pantalla. No representan tarjetas ni
// cuentas bancarias reales.
  const paymentMethods = {
    visa: { nombre: "Visa", terminacion: "4242", imagen: "/media/pagos/visa.png" },
    mastercard: { nombre: "Mastercard", terminacion: "4444", imagen: "/media/pagos/mastercard.svg" },
    paypal: { nombre: "PayPal" },
  };
  const toast = document.querySelector("[data-cart-toast]");
  const live = document.querySelector("[data-cart-live]");
  const dialogLive = dialog.querySelector("[data-cart-dialog-live]");
// Las regiones de estado permiten que un lector de pantalla anuncie cambios sin mover el
// foco.
  for (const region of [live, dialogLive]) {
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
  }
// Los temporizadores controlan el aviso breve y la pausa visual del pago. cart es la
// selección actual en memoria.
  let toastTimer;
  let storageAvailable = true;
  let cart = [];
  let paymentTimer;
  let processing = false;

// Lee el método elegido en los botones de opción. Visa es la selección inicial.
  function selectedMethod() {
    return paymentMethods[paymentRadios.find((radio) => radio.checked)?.value] || paymentMethods.visa;
  }

// Mientras se simula el pago, bloquea otro clic y muestra una señal de espera. No hace una
// petición a una pasarela.
  function setProcessing(value) {
    processing = value;
    paymentConfirm.disabled = value || !cart.length;
    paymentConfirm.setAttribute("aria-busy", String(value));
    paymentBack.disabled = value;
    for (const radio of paymentRadios) radio.disabled = value;
    payment.querySelector(".payment-spinner").hidden = !value;
    payment.querySelector("[data-payment-confirm-label]").textContent = value
      ? "Simulando pago…" : `Simular pago de ${money(total())} MXN`;
  }

// Vuelve a la lista de boletos y cancela cualquier pago que estuviera esperando. No borra
// la selección.
  function showCart() {
    clearTimeout(paymentTimer);
    setProcessing(false);
    shopping.hidden = false;
    complete.hidden = payment.hidden = true;
    dialog.dataset.stage = "cart";
    dialog.querySelector("#carrito-title").textContent = "Tus boletos";
    render();
  }

// Actualiza el aspecto del método seleccionado y el resumen usando siempre el carrito
// actual.
  function renderPayment() {
    const method = selectedMethod();
    const isPayPal = method === paymentMethods.paypal;
    payment.querySelector("[data-payment-card]").hidden = isPayPal;
    payment.querySelector("[data-payment-paypal]").hidden = !isPayPal;
    const logo = payment.querySelector("[data-payment-card-logo]");
    if (!isPayPal) {
      logo.src = method.imagen;
      logo.alt = method.nombre;
      const number = payment.querySelector("[data-payment-number]");
      number.textContent = `••••  ••••  ••••  ${method.terminacion}`;
      number.setAttribute("aria-label", `Tarjeta ficticia terminada en ${method.terminacion}`);
    }
    paymentConfirm.classList.toggle("is-paypal", isPayPal);
// Construye los renglones con elementos del navegador y textContent, para tratar los
// títulos como texto y no como HTML.
    const summary = payment.querySelector("[data-payment-items]");
    summary.replaceChildren();
    for (const item of cart) {
      const ticket = catalog.get(item.slug);
      const row = element("li", "");
      row.append(element("span", "", ticket.titulo), element("small", "", unitsLabel(item.cantidad)),
        element("strong", "", `${money(ticket.precioCentavos * item.cantidad)} MXN`));
      summary.append(row);
    }
    payment.querySelector("[data-payment-total]").textContent = `${money(total())} MXN`;
    if (!processing) setProcessing(false);
  }

// Revisa lo leído del navegador: acepta conferencias conocidas y cantidades enteras entre
// 1 y 99; agrupa las repetidas.
  function normalize(value) {
    if (!Array.isArray(value)) return [];
    const quantities = new Map();
    for (const item of value) {
      if (!item || !catalog.has(item.slug) || !Number.isInteger(item.cantidad)
        || item.cantidad < 1 || item.cantidad > maxQuantity) continue;
      quantities.set(item.slug, Math.min(maxQuantity, (quantities.get(item.slug) || 0) + item.cantidad));
    }
    return [...quantities].map(([slug, cantidad]) => ({ slug, cantidad }));
  }

// Recupera el carrito guardado. Si su JSON está roto, empieza vacío; si el navegador
// bloquea el almacenamiento, continúa en memoria.
  function load() {
    try {
      cart = normalize(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch (error) {
      cart = [];
      if (!(error instanceof SyntaxError)) storageAvailable = false;
    }
  }

// Guarda sólo slug y cantidad. Los nombres, las imágenes y los precios salen del catálogo,
// no de los datos guardados.
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      storageAvailable = false;
    }
    dialog.querySelector("[data-cart-storage]").hidden = storageAvailable;
  }

// Muestra un aviso corto. Si hay una ventana abierta, anuncia el mensaje dentro de ella
// para que siga siendo accesible.
  function announce(message) {
    (dialog.open ? dialogLive : live).textContent = message;
    toast.textContent = message;
    toast.hidden = dialog.open;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
  }

// Pequeña ayuda para crear un elemento, asignarle una clase y escribir texto de forma
// segura.
  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

// Crea un botón de cantidad o eliminación. data-cart-action y data-slug indican qué
// operación debe hacer.
  function control(action, slug, label, text) {
    const button = element("button", "cart-item-control", text);
    button.type = "button";
    button.dataset.cartAction = action;
    button.dataset.slug = slug;
    button.setAttribute("aria-label", label);
    return button;
  }

// Suma precio en centavos por cantidad. Usar enteros evita errores de redondeo al calcular
// dinero.
  function total() {
    return cart.reduce((sum, item) => sum + catalog.get(item.slug).precioCentavos * item.cantidad, 0);
  }

// Dibuja de nuevo el contador, las filas y los importes. El carrito vacío desactiva la
// compra y muestra una invitación a explorar.
  function render() {
    const quantity = cart.reduce((sum, item) => sum + item.cantidad, 0);
    document.querySelector("[data-cart-count]").textContent = quantity;
    toggle.setAttribute("aria-label", `Carrito, ${unitsLabel(quantity)}`);
    dialog.querySelector("[data-cart-units]").textContent = unitsLabel(quantity);
    const totalNode = dialog.querySelector("[data-cart-total]");
    totalNode.replaceChildren(document.createTextNode(`${money(total())} `), element("small", "", "MXN"));
    dialog.querySelector("[data-cart-empty]").hidden = cart.length > 0;
    items.hidden = cart.length === 0;
    clear.disabled = checkout.disabled = cart.length === 0;
    items.replaceChildren();
    for (const item of cart) {
      const ticket = catalog.get(item.slug);
      const row = element("li", "cart-item");
      row.dataset.cartItem = item.slug;
      const image = element("img", "cart-item-image");
      image.src = ticket.imagen;
      image.alt = "";
      image.width = 80;
      image.height = 80;
      const info = element("div", "cart-item-info");
      const title = element("a", "cart-item-title", ticket.titulo);
      title.href = `/conferencias/${ticket.slug}`;
      info.append(title, element("p", "cart-unit-price", `${money(ticket.precioCentavos)} MXN por boleto`));
// Los botones de menos y más se desactivan en los límites. Eliminar es una acción aparte
// para no borrar un boleto por accidente.
      const quantityControls = element("div", "cart-quantity");
      quantityControls.setAttribute("role", "group");
      quantityControls.setAttribute("aria-label", `Cantidad para ${ticket.titulo}`);
      const minus = control("minus", item.slug, `Restar un boleto: ${ticket.titulo}`, "−");
      minus.disabled = item.cantidad === 1;
      const plus = control("plus", item.slug, `Sumar un boleto: ${ticket.titulo}`, "+");
      plus.disabled = item.cantidad === maxQuantity;
      quantityControls.append(minus, element("span", "cart-quantity-value", item.cantidad), plus);
      const remove = control("remove", item.slug, `Eliminar: ${ticket.titulo}`, "Eliminar");
      remove.classList.add("cart-item-remove");
      const actions = element("div", "cart-item-actions");
      actions.append(quantityControls, remove);
      info.append(actions, element("p", "cart-subtotal", `${money(ticket.precioCentavos * item.cantidad)} MXN`));
      row.append(image, info);
      items.append(row);
    }
    renderPayment();
  }

// Cada cambio se guarda y luego se refleja en pantalla, para que el contador y el total
// coincidan.
  function update() {
    save();
    render();
  }

// Al iniciar, recupera la selección y habilita el botón del carrito. Sin este script, la
// página sigue permitiendo consultar conferencias.
  load();
  update();
  toggle.hidden = false;
// Abrir el carrito empieza por la selección de boletos y detiene el desplazamiento de la
// página de fondo.
  toggle.addEventListener("click", () => {
    paymentRadios[0].checked = true;
    showCart();
    dialog.showModal();
    document.body.classList.add("cart-open");
    toast.hidden = true;
  });
  dialog.querySelectorAll("[data-cart-close]").forEach((button) => {
    button.addEventListener("click", () => dialog.close());
  });
// Un clic fuera del panel cierra la ventana; un clic sobre su contenido no debe cerrarla.
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
// Al cerrar, cancela la espera del pago y devuelve el foco al botón que abre el carrito.
  dialog.addEventListener("close", () => {
    clearTimeout(paymentTimer);
    setProcessing(false);
    document.body.classList.remove("cart-open");
    toggle.focus({ preventScroll: true });
  });
// Tab y Shift+Tab recorren los controles de la ventana, sin saltar al contenido que quedó
// detrás.
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll('a[href], button:not(:disabled), input:checked:not(:disabled), [tabindex="0"]')]
      .filter((node) => node.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if ((event.shiftKey && document.activeElement === first)
      || (!event.shiftKey && document.activeElement === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  });

// Todos los botones de agregar comparten este comportamiento: suman una unidad o crean el
// renglón de la conferencia.
  document.querySelectorAll("[data-add-ticket]").forEach((button) => {
    if (!catalog.has(button.dataset.addTicket)) return;
    button.disabled = false;
    const label = button.querySelector("[data-add-label]");
    let labelTimer;
    button.addEventListener("click", () => {
      const slug = button.dataset.addTicket;
      const ticket = catalog.get(slug);
      const existing = cart.find((item) => item.slug === slug);
      if (existing?.cantidad === maxQuantity) {
        announce(`Puedes agregar hasta ${maxQuantity} boletos por conferencia.`);
        return;
      }
      if (existing) existing.cantidad += 1;
      else cart.push({ slug, cantidad: 1 });
      update();
      announce(`Boleto agregado: ${ticket.titulo}. Total: ${money(total())} MXN.`);
      label.textContent = "Agregado ✓";
      clearTimeout(labelTimer);
      labelTimer = setTimeout(() => { label.textContent = "Agregar al carrito"; }, 1500);
    });
  });

// Escucha los clics desde la lista: así los botones siguen funcionando aunque render haya
// creado filas nuevas.
  items.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;
    const { slug, cartAction: action } = button.dataset;
    const item = cart.find((entry) => entry.slug === slug);
    if (!item) return;
    if (action === "remove") cart = cart.filter((entry) => entry.slug !== slug);
    else item.cantidad = Math.max(1, Math.min(maxQuantity, item.cantidad + (action === "plus" ? 1 : -1)));
    update();
// Después de redibujar, busca un botón válido para mantener la navegación por teclado en
// una posición útil.
    const nextFocus = [...items.querySelectorAll("[data-cart-action]")].find((node) =>
      node.dataset.slug === slug && node.dataset.cartAction === action && !node.disabled)
      || items.querySelector("[data-cart-action]:not(:disabled)")
      || dialog.querySelector("[data-cart-close]");
    nextFocus.focus({ preventScroll: true });
    announce(action === "remove" ? `Conferencia eliminada. Total: ${money(total())} MXN.`
      : `${catalog.get(slug).titulo}: ${unitsLabel(item.cantidad)}. Total: ${money(total())} MXN.`);
  });
// Vaciar elimina la selección completa y guarda el carrito vacío en el navegador.
  clear.addEventListener("click", () => {
    cart = [];
    update();
    dialog.querySelector("[data-cart-close]").focus();
    announce("Tu carrito está vacío.");
  });
// Continuar al pago sólo cambia de pantalla. Los boletos siguen guardados hasta que se
// completa la simulación.
  checkout.addEventListener("click", () => {
    if (!cart.length || checkout.disabled) return;
    shopping.hidden = complete.hidden = true;
    payment.hidden = false;
    dialog.dataset.stage = "payment";
    dialog.querySelector("#carrito-title").textContent = "Pago simulado";
    renderPayment();
    payment.querySelector("[data-payment-scroll]").scrollTop = 0;
    payment.querySelector("#pago-title").focus();
  });
// Volver permite revisar cantidades y conserva el método elegido mientras esta ventana
// siga abierta.
  paymentBack.addEventListener("click", () => {
    showCart();
    checkout.focus();
  });
// Al cambiar Visa, Mastercard o PayPal, cambia la vista previa, no los precios.
  paymentRadios.forEach((radio) => radio.addEventListener("change", renderPayment));
// La pausa de 650 milisegundos representa un procesamiento ficticio. Cerrar la ventana
// cancela este temporizador.
  paymentConfirm.addEventListener("click", () => {
    if (!cart.length || processing) return;
    const method = selectedMethod();
    setProcessing(true);
    announce("Simulando el pago. No se realizará ningún cobro.");
    paymentTimer = setTimeout(() => completePurchase(method), 650);
  });

// Copia la selección al resumen final, muestra el método y después vacía el carrito. No se
// emiten boletos reales.
  function completePurchase(method) {
    if (!dialog.open || !cart.length) return;
    const receipt = dialog.querySelector("[data-cart-receipt]");
    receipt.replaceChildren();
    for (const item of cart) {
      const ticket = catalog.get(item.slug);
      const row = element("li", "");
      row.append(element("span", "", `${ticket.titulo} · ${unitsLabel(item.cantidad)}`),
        element("strong", "", `${money(ticket.precioCentavos * item.cantidad)} MXN`));
      receipt.append(row);
    }
    dialog.querySelector("[data-cart-receipt-total]").textContent = `${money(total())} MXN`;
    dialog.querySelector("[data-payment-receipt-method]").textContent = method.terminacion
      ? `Método simulado: ${method.nombre} ···· ${method.terminacion}` : "Método simulado: PayPal · Cuenta de demostración";
    cart = [];
    setProcessing(false);
    update();
    shopping.hidden = payment.hidden = true;
    complete.hidden = false;
    dialog.dataset.stage = "complete";
    dialog.querySelector("#carrito-title").textContent = "Tu confirmación";
    document.querySelector("#compra-title").focus();
    announce("Compra simulada completada. No se realizó ningún cobro.");
  }

// Si otra pestaña cambia el carrito, actualiza los importes y cancela una confirmación
// pendiente para evitar mostrar un total anterior.
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey && event.key !== null) return;
    clearTimeout(paymentTimer);
    load();
    setProcessing(false);
    render();
    if (!payment.hidden) {
      if (!cart.length) {
        showCart();
        dialog.querySelector("[data-cart-close]").focus();
      }
      announce("El carrito cambió en otra pestaña. Revisa el total antes de simular el pago.");
    }
  });
})();
