// Añade interacción a las páginas: menú móvil, fotografías y envío de comentarios. El HTML
// mantiene sus enlaces y formularios cuando JavaScript está desactivado.
// La clase js permite que el CSS active los comportamientos que sí necesitan JavaScript.
document.documentElement.classList.add("js");

// Busca el botón y los enlaces del menú. aria-expanded comunica si está abierto a las
// herramientas de accesibilidad.
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav-links");
if (navToggle && nav) {
  navToggle.hidden = false;
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
  });
// Escape cierra el menú y devuelve el foco a su botón.
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      nav.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

// Prepara cada carrusel por separado; sus flechas, contador y temporizador no se mezclan
// con los de otro carrusel.
document.querySelectorAll("[data-photo-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-photo-track]");
  const slides = [...track.children];
  const controls = carousel.querySelector("[data-photo-controls]");
  if (!controls || slides.length < 2) return;

  const previous = carousel.querySelector("[data-photo-previous]");
  const next = carousel.querySelector("[data-photo-next]");
  const status = carousel.querySelector("[data-photo-status]");
  const pause = carousel.querySelector("[data-photo-pause]");
// Respeta la preferencia del sistema para reducir movimiento: el carrusel comienza pausado
// cuando está activada.
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let scrollFrame;
  let timer;
  let paused = reducedMotion.matches;
  let hovered = false;
  let visible = false;
  let allowFocusedPlayback = false;

// Sólo programa el siguiente avance si el carrusel está visible y no se está usando.
// Cancela primero el temporizador anterior.
  function schedule() {
    clearTimeout(timer);
    const focused = carousel.contains(document.activeElement);
    const rotating = !paused && !hovered && visible && !document.hidden
      && (!focused || allowFocusedPlayback)
      && !document.querySelector(".image-dialog[open]");
// Mientras rota automáticamente, evita que el lector de pantalla anuncie cada foto sin que
// la persona lo haya pedido.
    status.setAttribute("aria-live", rotating ? "off" : "polite");
    pause.textContent = paused ? "Reanudar" : "Pausar";
    pause.setAttribute("aria-label", paused ? "Reanudar carrusel" : "Pausar carrusel");
    if (rotating) {
      timer = setTimeout(() => {
        goTo((current + 1) % slides.length);
        schedule();
      }, 6000);
    }
  }

// Calcula la foto visible a partir del desplazamiento y actualiza flechas, contador y
// acceso por teclado.
  function update() {
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / step)));
    current = index;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    const message = `Foto ${index + 1} de ${slides.length}`;
    if (status.textContent !== message) status.textContent = message;
    slides.forEach((slide, i) => {
      slide.querySelector("[data-lightbox]").tabIndex = i === index ? 0 : -1;
    });
  }

// Mueve la tira hasta la foto elegida, sin salir de los límites de la colección.
  function goTo(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[target].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }

// Estos controles permiten avanzar, retroceder y pausar manualmente.
  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  pause.addEventListener("click", () => {
    paused = !paused;
    allowFocusedPlayback = !paused;
    schedule();
  });
// Al pasar el ratón o enfocar un control, pausa el avance para no mover una foto mientras
// se está revisando.
  carousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    hovered = true;
    schedule();
  });
  carousel.addEventListener("pointerleave", () => {
    hovered = false;
    schedule();
  });
  carousel.addEventListener("focusin", () => {
    allowFocusedPlayback = false;
    schedule();
  });
  carousel.addEventListener("focusout", () => queueMicrotask(schedule));
// También se pausa al cambiar de pestaña o al mostrar una fotografía ampliada.
  document.addEventListener("visibilitychange", schedule);
  document.querySelector(".image-dialog")?.addEventListener("close", schedule);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) paused = true;
    schedule();
  });
// El observador avisa cuando el carrusel entra o sale de la pantalla; no necesita revisar
// su posición continuamente.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
    schedule();
  }, { threshold: 0.3 }).observe(track);
// Las flechas del teclado recorren fotos. Inicio y Fin llevan a los extremos.
  track.addEventListener("keydown", (event) => {
    const target = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: slides.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    // El foco sigue a la foto cuando se recorre desde su enlace.
    const followFocus = document.activeElement.matches("[data-lightbox]");
    goTo(target);
    if (followFocus) {
      slides[Math.max(0, Math.min(slides.length - 1, target))]
        .querySelector("[data-lightbox]").focus({ preventScroll: true });
    }
  });
// El desplazamiento manual también actualiza el contador. requestAnimationFrame agrupa los
// cambios con el repintado del navegador.
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      update();
      schedule();
    });
  }, { passive: true });
// Si cambia el ancho de la pantalla, vuelve a alinear la misma foto en lugar de saltar a
// otra.
  new ResizeObserver(() => {
    track.scrollTo({ left: slides[current].offsetLeft - slides[0].offsetLeft, behavior: "instant" });
    update();
  }).observe(track);
  controls.hidden = false;
  update();
  schedule();
});

// Esta ventana nativa amplía las fotos. El enlace a la imagen sigue funcionando si la
// ventana no está disponible.
const dialog = document.querySelector(".image-dialog");
if (dialog && typeof dialog.showModal === "function") {
  const image = dialog.querySelector(".dialog-image");
  const caption = dialog.querySelector(".dialog-caption");
  let opener;
  document.querySelectorAll("[data-lightbox]").forEach((link) => {
// Los clics normales abren el visor; los modificadores del teclado conservan las opciones
// habituales de abrir enlaces en otra pestaña.
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector("img")?.alt || "";
      caption.textContent = link.dataset.caption || "";
      dialog.showModal();
      document.body.classList.add("dialog-open");
    });
  });
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
// Al cerrar el visor, limpia la imagen y devuelve el foco al enlace de la foto que se
// abrió.
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    image.removeAttribute("src");
    opener?.focus();
  });
}

// Este formulario puede enviarse normalmente. Si fetch está disponible, muestra la
// respuesta sin recargar toda la página.
const form = document.querySelector("[data-comment-form]");
if (form) {
  const textarea = form.querySelector("[name=mensaje]");
  const counter = form.querySelector("[data-character-count]");
  const progress = form.querySelector("[data-character-progress]");
// El contador y la barra indican cuántos caracteres se han escrito; el servidor vuelve a
// comprobar los límites.
  textarea.addEventListener("input", () => {
    counter.textContent = `${textarea.value.length}/1500`;
    progress.value = textarea.value.length;
  });
// Al enviar, borra errores anteriores y desactiva el botón hasta recibir una respuesta.
  form.addEventListener("submit", async (event) => {
    if (!window.fetch) return;
    event.preventDefault();
    const button = form.querySelector("[type=submit]");
    const status = form.querySelector(".form-status");
    const label = button.textContent;
    form.querySelectorAll("[data-error]").forEach((el) => {
      el.textContent = "";
    });
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((el) => el.removeAttribute("aria-invalid"));
    button.disabled = true;
    button.textContent = "Enviando…";
    status.hidden = true;
    form.setAttribute("aria-busy", "true");
    // Un fallo de red puede ocurrir después de guardar: nunca se reenvía automáticamente.
    try {
// Manda los campos como JSON, incluido el token CSRF. La ruta es la misma que usa el
// formulario HTML.
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await response.json();
      status.textContent = data.mensaje;
      status.classList.toggle("is-error", !response.ok);
      status.hidden = false;
// Sólo después de confirmar el guardado limpia el texto. Conserva el token de la sesión
// para el siguiente envío.
      if (response.ok) {
        const token = form.querySelector("[name=_csrf]").value;
        form.reset();
        form.querySelector("[name=_csrf]").value = token;
        counter.textContent = "0/1500";
        progress.value = 0;
        status.focus();
      } else {
// Si el servidor devuelve errores, los coloca junto al campo correspondiente y enfoca el
// primero.
        for (const [field, message] of Object.entries(data.errors || {})) {
          const error = form.querySelector(`[data-error="${field}"]`);
          if (error) error.textContent = message;
          form.elements.namedItem(field)?.setAttribute("aria-invalid", "true");
        }
        (form.querySelector("[aria-invalid=true]") || status).focus();
      }
// Si falla la conexión, conserva el texto y evita reenviar automáticamente, porque el
// servidor podría haberlo guardado.
    } catch {
      status.textContent =
        "No pudimos confirmar el envío. Conservamos tu texto. Comprueba tu conexión antes de intentarlo de nuevo.";
      status.classList.add("is-error");
      status.hidden = false;
      status.focus();
// Siempre devuelve el botón a su estado normal, haya éxito o error.
    } finally {
      button.disabled = false;
      button.textContent = label;
      form.removeAttribute("aria-busy");
    }
  });
}
