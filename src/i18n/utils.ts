import { locales, defaultLocale } from './locales.js';
import en from './ui/en.json';
import fr from './ui/fr.json';

export type Locale = (typeof locales)[number];
type UiKey = keyof typeof en;

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, fr };

/** Повертає функцію перекладу для мови: t('nav.home') */
export function useTranslations(lang: Locale) {
  return (key: UiKey): string => dictionaries[lang][key] ?? en[key];
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Підпапка сайту: '/' на IONOS, '/datatixx/' на GitHub Pages */
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Додає підпапку до шляху від кореня сайту: withBase('/favicon.svg') */
export function withBase(path: string): string {
  return BASE + path.replace(/^\/+/, '');
}

/** Шлях на сторінку в потрібній мові: localizePath('/contact/', 'fr') → '/fr/contact/' */
export function localizePath(path: string, lang: Locale): string {
  // '#faq' → '/en/#faq' (якір на головній)
  if (path.startsWith('#')) return withBase(`${lang}/${path}`);
  const clean = path.replace(/^\/+|\/+$/g, '');
  return withBase(clean ? `${lang}/${clean}/` : `${lang}/`);
}

/** Та сама сторінка іншою мовою (для перемикача мов) */
export function switchLocale(pathname: string, lang: Locale): string {
  const rest = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname;
  const parts = rest.split('/').filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  return localizePath(parts.join('/'), lang);
}

export { locales, defaultLocale };
