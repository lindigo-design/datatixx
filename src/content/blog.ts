/**
 * Блог: статті, чернетки, час читання, номер випуску, переклади.
 * Статті — src/content/blog/<мова>/<slug>.mdoc (редагуються в Keystatic: «Blog (EN)» / «Blog (FR)»).
 */
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { localizePath, type Locale } from '@/i18n/utils';

export type Post = CollectionEntry<'blog'>;

/** Чернетки видно лише в `npm run dev`; у зібраному сайті їх немає (сторінки, списки, sitemap). */
const visible = (p: Post) => import.meta.env.DEV || !p.data.draft;

export const postLang = (p: Post) => p.id.split('/')[0] as Locale;
export const postSlug = (p: Post) => p.id.split('/').slice(1).join('/');

/** Статті мови, від найновішої до найстарішої. */
export async function getPosts(lang: Locale): Promise<Post[]> {
  const posts = await getCollection(
    'blog',
    p => postLang(p) === lang && visible(p)
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** «No. 01» — порядковий номер статті в її мові (найстаріша = 01). */
export async function issueNumber(post: Post): Promise<string> {
  const all = await getPosts(postLang(post));
  const oldestFirst = [...all].reverse();
  const n = oldestFirst.findIndex(p => p.id === post.id) + 1;
  return String(n).padStart(2, '0');
}

/** Час читання (хв): ≈200 слів за хвилину, рахуємо по тексту без Markdoc-тегів і розмітки. */
export function readingTime(post: Post): number {
  const text = (post.body ?? '')
    .replace(/\{%[\s\S]*?%\}/g, ' ') // теги {% … %}, але їхні текстові атрибути теж читаються:
    .replace(/[#>*_`[\]()!-]/g, ' ');
  const tagText = [
    ...(post.body ?? '').matchAll(
      /(?:title|titleAccent|text|label|footnote)="([^"]*)"/g
    ),
  ]
    .map(m => m[1])
    .join(' ');
  const words = `${post.data.lead} ${text} ${tagText}`
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Переклад статті (той самий translationKey в іншій мові), якщо він видимий. */
export async function getTranslation(
  post: Post,
  lang: Locale
): Promise<Post | undefined> {
  const posts = await getPosts(lang);
  return posts.find(p => p.data.translationKey === post.data.translationKey);
}

/** Тексти сторінки блогу (blog.json). */
export async function getBlogPage(lang: Locale) {
  const entry = await getEntry('blogPage', `${lang}/blog`);
  if (!entry)
    throw new Error(`Немає текстів блогу: src/content/pages/${lang}/blog.json`);
  return entry.data;
}

/** Адреса статті: /en/blog/<slug>/ */
export const postUrl = (post: Post) =>
  localizePath(`blog/${postSlug(post)}`, postLang(post));

/** «15 Oct 2026» / «15 oct. 2026» (на сторінці — великими літерами через CSS) */
export const formatShortDate = (date: Date, lang: Locale) =>
  date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** Мета статті: «15 Oct 2026 • 8 min read» */
export const postMeta = (post: Post, minRead: string) =>
  `${formatShortDate(post.data.date, postLang(post))} • ${readingTime(post)} ${minRead}`;
