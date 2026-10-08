import { getEntry } from 'astro:content';
import type { Locale } from '@/i18n/utils';

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
