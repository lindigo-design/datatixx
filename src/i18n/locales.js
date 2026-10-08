// Список мов сайту. Щоб додати мову: додай код сюди,
// створи src/i18n/ui/<код>.json і src/content/pages/<код>/*.json
export const locales = /** @type {const} */ (['en', 'fr']);
export const defaultLocale = 'en';

export const localeNames = {
  en: 'English',
  fr: 'Français',
};
