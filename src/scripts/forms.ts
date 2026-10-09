/**
 * Форми сайту ([data-ajax-form]): Contact, Partners, анкета Chambers.
 *
 * 1. Поки обов'язкові поля не заповнені, кнопка виглядає неактивною,
 *    а під нею підказка: «Заповніть поля з * — і кнопка стане активною (залишилось: N)».
 *    Кнопку НЕ вимикаємо повністю (disabled): її можна натиснути —
 *    тоді форма підсвітить порожні поля і поставить курсор у перше з них.
 * 2. Після успішної відправки форма ховається і з'являється панель «Повідомлення надіслано».
 *
 * Без JavaScript форма відправляється звичайним способом — обробник повертає на сторінку з ?sent=1 / ?error=1.
 */
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Відповідь обробника після відправки без JS: ?sent=1 або ?error=1
const returned = new URLSearchParams(location.search);

for (const form of document.querySelectorAll<HTMLFormElement>(
  '[data-ajax-form]'
)) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const hint = form.querySelector<HTMLElement>('[data-hint]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const ts = form.querySelector<HTMLInputElement>('[data-ts]')!;
  const done = form.querySelector<HTMLElement>('[data-done]');
  const again = form.querySelector<HTMLButtonElement>('[data-again]');
  const msg = form.dataset;
  // Сервер отримує не час, а скільки мс форма була відкрита — так годинник відвідувача не впливає
  let openedAt = Date.now();

  const show = (text: string, kind: 'success' | 'error' | '') => {
    status.textContent = text;
    status.className = `form__status ${kind ? `is-${kind}` : ''}`;
  };

  const fields = () => [
    ...form.querySelectorAll<Field>(
      'input:not([type=hidden]):not([tabindex="-1"]), textarea, select'
    ),
  ];

  /** Скільки обов'язкових полів ще не заповнено (група радіокнопок рахується як одне поле). */
  const missing = () => {
    const names = new Set<string>();
    for (const f of fields()) {
      if (!f.checkValidity()) names.add(f.name || f.id);
    }
    return names.size;
  };

  // Стан кнопки і текст підказки
  const update = () => {
    const left = missing();
    const locked = left > 0;
    submit.classList.toggle('is-locked', locked);
    submit.setAttribute('aria-disabled', String(locked));
    if (hint) {
      hint.hidden = !locked;
      if (!locked) hint.classList.remove('is-alert');
      hint.textContent = locked
        ? (msg.msgHint ?? '').replace('{n}', String(left))
        : '';
    }
  };

  if (hint) submit.setAttribute('aria-describedby', hint.id);
  update();
  form.addEventListener('input', event => {
    const f = event.target as Field;
    // Поле виправили — знімаємо червону рамку одразу
    if (f.getAttribute('aria-invalid') === 'true' && f.checkValidity()) {
      f.setAttribute('aria-invalid', 'false');
    }
    // Людина вже виправляє форму — стара помилка відправки більше не потрібна
    if (status.classList.contains('is-error')) show('', '');
    update();
  });
  form.addEventListener('change', update);

  const finish = () => {
    // Заявка надіслана — подія для Google Analytics (лише якщо є згода і GA завантажено)
    window.gtag?.('event', 'generate_lead', {
      form: form.getAttribute('action'),
    });
    form.reset();
    openedAt = Date.now();
    show('', '');
    update();
    if (done) {
      form.classList.add('is-done');
      done.hidden = false;
      done.focus();
    } else {
      show(msg.msgSuccess ?? '', 'success');
    }
  };

  again?.addEventListener('click', () => {
    form.classList.remove('is-done');
    if (done) done.hidden = true;
    fields()[0]?.focus();
  });

  // Повернення після відправки без JavaScript
  if (returned.has('sent')) finish();
  if (returned.has('error')) show(msg.msgError ?? '', 'error');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.dataset.busy) return;

    // Перевірка в браузері — для зручності. Справжня перевірка — на сервері.
    let firstInvalid: Field | null = null;
    for (const f of fields()) {
      const ok = f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
    }
    if (firstInvalid) {
      // Є підказка під кнопкою — робимо її червоною, щоб не дублювати два повідомлення
      if (hint) hint.classList.add('is-alert');
      else show(msg.msgRequired ?? '', 'error');
      firstInvalid.focus();
      return;
    }

    submit.dataset.busy = '1';
    submit.setAttribute('aria-disabled', 'true');
    show(msg.msgSending ?? '', '');
    ts.value = String(Date.now() - openedAt);

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
      finish();
    } catch {
      show(msg.msgError ?? '', 'error');
    } finally {
      delete submit.dataset.busy;
      update();
    }
  });
}

// Повідомлення вже показали — прибираємо ?sent / ?error з адреси,
// щоб після оновлення сторінки панель «Надіслано» не з'являлась знову
if (returned.has('sent') || returned.has('error')) {
  const url = new URL(location.href);
  url.searchParams.delete('sent');
  url.searchParams.delete('error');
  history.replaceState(history.state, '', url);
}
