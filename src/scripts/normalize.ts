/** Текст для пошуку: без регістру й наголосів («é» = «e»). Спільне для збірки і браузера. */
export const normalizeSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
