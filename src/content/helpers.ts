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

export async function getBenefits(lang: Locale) {
  const entry = await getEntry('benefits', `${lang}/benefits`);
  if (!entry)
    throw new Error(
      `Немає тексту Benefits: src/content/pages/${lang}/benefits.json`
    );
  return entry.data;
}

export async function getPartners(lang: Locale) {
  const entry = await getEntry('partners', `${lang}/partners`);
  if (!entry)
    throw new Error(
      `Немає тексту Partners: src/content/pages/${lang}/partners.json`
    );
  return entry.data;
}

export async function getChambers(lang: Locale) {
  const entry = await getEntry('chambers', `${lang}/chambers`);
  if (!entry)
    throw new Error(
      `Немає тексту Chambers: src/content/pages/${lang}/chambers.json`
    );
  return entry.data;
}

export async function getTeam(lang: Locale) {
  const entry = await getEntry('team', `${lang}/team`);
  if (!entry)
    throw new Error(`Немає тексту Team: src/content/pages/${lang}/team.json`);
  return entry.data;
}

export async function getContact(lang: Locale) {
  const entry = await getEntry('contact', `${lang}/contact`);
  if (!entry)
    throw new Error(
      `Немає тексту Contact: src/content/pages/${lang}/contact.json`
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
