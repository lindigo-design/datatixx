/**
 * Кнопки «Copy link» у статті: <button data-copy-link="https://…" data-copied="Link copied">.
 * Повідомлення показується в найближчому [data-copy-status] (aria-live) на 2 секунди.
 */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Запасний варіант для старих браузерів і сторінок без доступу до буфера
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.className = 'visually-hidden';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>(
  '[data-copy-link]'
)) {
  const status = button
    .closest('[data-share]')
    ?.querySelector<HTMLElement>('[data-copy-status]');
  let timer: number | undefined;
  button.addEventListener('click', async () => {
    const ok = await copy(button.dataset.copyLink ?? location.href);
    if (!ok || !status) return;
    status.textContent = button.dataset.copied ?? '';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => (status.textContent = ''), 2000);
  });
}
