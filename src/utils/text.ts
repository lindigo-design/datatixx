/** Екранує HTML, щоб текст з адмінки не міг вставити розмітку чи скрипт. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Виділяє назву продукту «Datixxia™» напівжирним (безпечно: спершу екранування). */
export function boldBrand(s: string): string {
  return escapeHtml(s).replace(/(datixxia™)/gi, '<strong>$1</strong>');
}

/** Абзаци з переносів рядка. */
export function paragraphs(s: string): string[] {
  return s
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);
}
