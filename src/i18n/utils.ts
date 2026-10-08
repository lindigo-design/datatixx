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

/** Шлях на сторінку в потрібній мові: localizePath('/contact/', 'fr') → '/fr/contact/' */
export function localizePath(path: string, lang: Locale): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Та сама сторінка іншою мовою (для перемикача мов) */
export function switchLocale(pathname: string, lang: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (isLocale(parts[0])) parts.shift();
  return localizePath(parts.join('/'), lang);
}

export { locales, defaultLocale };
