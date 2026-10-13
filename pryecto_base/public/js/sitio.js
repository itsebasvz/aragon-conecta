document.documentElement.classList.add("js");

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#nav-links");
if (navToggle && nav) {
  navToggle.hidden = false;
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
  });
  nav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      nav.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.focus();
    }
  });
}

document.querySelectorAll("[data-photo-carousel]").forEach((carousel) => {
  const track = carousel.querySelector("[data-photo-track]");
  const slides = [...track.children];
  const controls = carousel.querySelector("[data-photo-controls]");
  if (!controls || slides.length < 2) return;

  const previous = carousel.querySelector("[data-photo-previous]");
  const next = carousel.querySelector("[data-photo-next]");
  const status = carousel.querySelector("[data-photo-status]");
  const pause = carousel.querySelector("[data-photo-pause]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let scrollFrame;
  let timer;
  let paused = reducedMotion.matches;
  let hovered = false;
  let visible = false;
  let allowFocusedPlayback = false;

  function schedule() {
    clearTimeout(timer);
    const focused = carousel.contains(document.activeElement);
    const rotating = !paused && !hovered && visible && !document.hidden
      && (!focused || allowFocusedPlayback)
      && !document.querySelector(".image-dialog[open]");
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

  function goTo(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    track.scrollTo({
      left: slides[target].offsetLeft - slides[0].offsetLeft,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }

  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  pause.addEventListener("click", () => {
    paused = !paused;
    allowFocusedPlayback = !paused;
    schedule();
  });
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
  document.addEventListener("visibilitychange", schedule);
  document.querySelector(".image-dialog")?.addEventListener("close", schedule);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) paused = true;
    schedule();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
    schedule();
  }, { threshold: 0.3 }).observe(track);
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
  track.addEventListener("scroll", () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
      update();
      schedule();
    });
  }, { passive: true });
  new ResizeObserver(() => {
    track.scrollTo({ left: slides[current].offsetLeft - slides[0].offsetLeft, behavior: "instant" });
    update();
  }).observe(track);
  controls.hidden = false;
  update();
  schedule();
});

const dialog = document.querySelector(".image-dialog");
if (dialog && typeof dialog.showModal === "function") {
  const image = dialog.querySelector(".dialog-image");
  const caption = dialog.querySelector(".dialog-caption");
  let opener;
  document.querySelectorAll("[data-lightbox]").forEach((link) => {
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
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    image.removeAttribute("src");
    opener?.focus();
  });
}

const form = document.querySelector("[data-comment-form]");
if (form) {
  const textarea = form.querySelector("[name=mensaje]");
  const counter = form.querySelector("[data-character-count]");
  textarea.addEventListener("input", () => {
    counter.textContent = `${textarea.value.length}/1500`;
  });
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
      if (response.ok) {
        const token = form.querySelector("[name=_csrf]").value;
        form.reset();
        form.querySelector("[name=_csrf]").value = token;
        counter.textContent = "0/1500";
        status.focus();
      } else {
        for (const [field, message] of Object.entries(data.errors || {})) {
          const error = form.querySelector(`[data-error="${field}"]`);
          if (error) error.textContent = message;
          form.elements.namedItem(field)?.setAttribute("aria-invalid", "true");
        }
        (form.querySelector("[aria-invalid=true]") || status).focus();
      }
    } catch {
      status.textContent =
        "No pudimos confirmar el envío. Conservamos tu texto. Comprueba tu conexión antes de intentarlo de nuevo.";
      status.classList.add("is-error");
      status.hidden = false;
      status.focus();
    } finally {
      button.disabled = false;
      button.textContent = label;
      form.removeAttribute("aria-busy");
    }
  });
}
