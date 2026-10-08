/**
 * Відправка форм без перезавантаження сторінки ([data-ajax-form]).
 * Без JavaScript форма відправляється звичайним способом — обробник повертає на сторінку з ?sent=1 / ?error=1.
 */
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

for (const form of document.querySelectorAll<HTMLFormElement>(
  '[data-ajax-form]'
)) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const ts = form.querySelector<HTMLInputElement>('[data-ts]')!;
  const msg = form.dataset;
  ts.value = String(Date.now());

  const show = (text: string, kind: 'success' | 'error' | '') => {
    status.textContent = text;
    status.className = `form__status ${kind ? `is-${kind}` : ''}`;
  };

  // Повернення після відправки без JavaScript
  const params = new URLSearchParams(location.search);
  if (params.has('sent')) show(msg.msgSuccess ?? '', 'success');
  if (params.has('error')) show(msg.msgError ?? '', 'error');

  const fields = () => [
    ...form.querySelectorAll<Field>(
      'input:not([type=hidden]), textarea, select'
    ),
  ];

  form.addEventListener('submit', async event => {
    event.preventDefault();

    // Перевірка в браузері — для зручності. Справжня перевірка — на сервері.
    let firstInvalid: Field | null = null;
    for (const f of fields()) {
      const ok = f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
    }
    if (firstInvalid) {
      show(msg.msgRequired ?? '', 'error');
      firstInvalid.focus();
      return;
    }

    submit.disabled = true;
    show(msg.msgSending ?? '', '');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        // Сервер підказав, які поля неправильні — підсвічуємо їх
        for (const name of (data.fields as string[] | undefined) ?? []) {
          form
            .querySelector(`[name="${CSS.escape(name)}"]`)
            ?.setAttribute('aria-invalid', 'true');
        }
        throw new Error(String(response.status));
      }
      form.reset();
      ts.value = String(Date.now());
      show(msg.msgSuccess ?? '', 'success');
    } catch {
      show(msg.msgError ?? '', 'error');
    } finally {
      submit.disabled = false;
    }
  });
}
