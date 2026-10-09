/**
 * Поява тексту при прокручуванні (як GSAP + SplitType, але без бібліотек).
 *
 * [data-reveal="lines"] — текст ділиться на рядки; рядки по черзі виїжджають знизу,
 *   спершу сірі напівпрозорі, потім стають свого звичайного кольору.
 * [data-reveal="fade"]  — блок (картка, заголовок, зображення) виїжджає трохи знизу,
 *   теж спершу сірий напівпрозорий, потім у своїх кольорах.
 *
 * Блоки, що з'являються на екрані одночасно, проявляються по черзі —
 * зверху вниз і зліва направо (крок 0.12 с, через --reveal-stagger).
 * Додаткову затримку окремому блоку можна дати в CSS: --reveal-delay.
 *
 * Анімація повторюється щоразу, коли блок знову з'являється на екрані.
 * Без JavaScript і з «зменшити рух» у системі — текст одразу видно, без анімації.
 * Стилі — у styles/components.css (розділ «Поява тексту»).
 */
const items = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Розбити текст на рядки так, як їх зараз розклав браузер. */
function splitLines(el: HTMLElement) {
  const text = (el.dataset.revealText ??= (el.textContent ?? '').trim());

  // 1. Слова окремими span — щоб побачити, на якому рядку кожне
  el.textContent = '';
  const words = text.split(/\s+/).map((w, i) => {
    const span = document.createElement('span');
    span.textContent = w;
    if (i) el.append(' ');
    el.append(span);
    return span;
  });

  // 2. Групуємо слова за вертикальною позицією
  const lines: string[][] = [];
  let top: number | null = null;
  for (const w of words) {
    if (w.offsetTop !== top) {
      lines.push([]);
      top = w.offsetTop;
    }
    lines[lines.length - 1].push(w.textContent ?? '');
  }

  // 3. Кожен рядок — у «вікні» з overflow: hidden
  el.textContent = '';
  lines.forEach((ws, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'reveal__wrap';
    const line = document.createElement('span');
    line.className = 'reveal__line';
    line.textContent = ws.join(' ');
    // Затримка для кожного наступного рядка (CSSOM — працює з CSP)
    line.style.setProperty('--i', String(i));
    wrap.append(line);
    el.append(wrap, i < lines.length - 1 ? ' ' : '');
  });
}

if (items.length && !still) {
  // Шрифт має завантажитись, інакше рядки розіб'ються неправильно
  document.fonts.ready.then(() => {
    for (const el of items) {
      if (el.dataset.reveal === 'lines') splitLines(el);
      el.classList.add('is-ready');
    }

    const io = new IntersectionObserver(
      entries => {
        // Ті, що з'явились разом, — по черзі: зверху вниз, зліва направо
        const entering = entries
          .filter(e => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top ||
              a.boundingClientRect.left - b.boundingClientRect.left
          );
        entering.forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty('--reveal-stagger', `${i * 0.12}s`);
          el.classList.add('is-in');
        });
        for (const e of entries) {
          if (!e.isIntersecting) e.target.classList.remove('is-in');
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    for (const el of items) io.observe(el);

    // Ширина змінилась (поворот екрана, зміна вікна) — перебиваємо рядки
    let lastWidth = innerWidth;
    let timer = 0;
    addEventListener('resize', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (innerWidth === lastWidth) return;
        lastWidth = innerWidth;
        for (const el of items) {
          if (el.dataset.reveal === 'lines') splitLines(el);
        }
      }, 200);
    });
  });
}
