document.documentElement.classList.add('js');

const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#nav-links');
if (navToggle && nav) {
  navToggle.hidden = false;
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  });
  nav.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      nav.dataset.open = 'false';
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });
}

const dialog = document.querySelector('.image-dialog');
if (dialog && typeof dialog.showModal === 'function') {
  const image = dialog.querySelector('.dialog-image');
  const caption = dialog.querySelector('.dialog-caption');
  let opener;
  document.querySelectorAll('[data-lightbox]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector('img')?.alt || '';
      caption.textContent = link.dataset.caption || '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    image.removeAttribute('src');
    opener?.focus();
  });
}

const form = document.querySelector('[data-comment-form]');
if (form) {
  const textarea = form.querySelector('[name=mensaje]');
  const counter = form.querySelector('[data-character-count]');
  textarea.addEventListener('input', () => { counter.textContent = `${textarea.value.length}/1500`; });
  form.addEventListener('submit', async event => {
    if (!window.fetch) return;
    event.preventDefault();
    const button = form.querySelector('[type=submit]');
    const status = form.querySelector('.form-status');
    const label = button.textContent;
    form.querySelectorAll('[data-error]').forEach(el => { el.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    button.disabled = true;
    button.textContent = 'Enviando…';
    status.hidden = true;
    form.setAttribute('aria-busy', 'true');
    // Un fallo de red puede ocurrir después de guardar: nunca se reenvía automáticamente.
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const data = await response.json();
      status.textContent = data.mensaje;
      status.classList.toggle('is-error', !response.ok);
      status.hidden = false;
      if (response.ok) {
        const token = form.querySelector('[name=_csrf]').value;
        form.reset();
        form.querySelector('[name=_csrf]').value = token;
        counter.textContent = '0/1500';
        status.focus();
      } else {
        for (const [field, message] of Object.entries(data.errors || {})) {
          const error = form.querySelector(`[data-error="${field}"]`);
          if (error) error.textContent = message;
          form.elements.namedItem(field)?.setAttribute('aria-invalid', 'true');
        }
        (form.querySelector('[aria-invalid=true]') || status).focus();
      }
    } catch {
      status.textContent = 'No pudimos confirmar el envío. Conservamos tu texto. Comprueba tu conexión antes de intentarlo de nuevo.';
      status.classList.add('is-error');
      status.hidden = false;
      status.focus();
    } finally {
      button.disabled = false;
      button.textContent = label;
      form.removeAttribute('aria-busy');
    }
  });
}
