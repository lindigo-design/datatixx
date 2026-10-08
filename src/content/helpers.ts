import { getEntry } from 'astro:content';
import type { Locale } from '@/i18n/utils';

export async function getHome(lang: Locale) {
  const entry = await getEntry('home', `${lang}/home`);
  if (!entry)
    throw new Error(
      `Немає тексту головної: src/content/pages/${lang}/home.json`
    );
  return entry.data;
}

export async function getAbout(lang: Locale) {
  const entry = await getEntry('about', `${lang}/about`);
  if (!entry)
    throw new Error(`Немає тексту About: src/content/pages/${lang}/about.json`);
  return entry.data;
}

export async function getPlatform(lang: Locale) {
  const entry = await getEntry('platform', `${lang}/platform`);
  if (!entry)
    throw new Error(
      `Немає тексту Platform: src/content/pages/${lang}/platform.json`
    );
  return entry.data;
}

export async function getPage(slug: string, lang: Locale) {
  const entry = await getEntry('pages', `${lang}/${slug}`);
  if (!entry)
    throw new Error(
      `Немає тексту сторінки: src/content/pages/${lang}/${slug}.json`
    );
  return entry.data;
}

export async function getSiteSettings() {
  const entry = await getEntry('site', 'settings');
  if (!entry) throw new Error('Немає src/content/site/settings.json');
  return entry.data;
}

/** Номер телефону для посилання tel: (без пробілів) */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
