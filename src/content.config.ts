import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

// Тексти сторінок по мовах: src/content/pages/<мова>/<сторінка>.json
// id виходить «en/home», «fr/contact» тощо. Редагуються в адмінці Keystatic.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.looseObject({
      seoTitle: z.string(),
      seoDescription: z.string().max(170),
      // поля головної
      heroLabel: z.string().optional(),
      heroTitle: z.string().optional(),
      heroLead: z.string().optional(),
      heroCta: z.string().optional(),
      heroImage: image().nullable().optional(),
      heroImageAlt: z.string().optional(),
      tickerItems: z
        .array(z.object({ name: z.string(), change: z.number() }))
        .optional(),
      // поля звичайних сторінок
      title: z.string().optional(),
      lead: z.string().optional(),
    }),
});

// Дані компанії — одні для всіх мов
const site = defineCollection({
  loader: file('./src/content/site/settings.json', {
    parser: text => ({ settings: JSON.parse(text) }),
  }),
  schema: z.object({
    companyName: z.string(),
    brandName: z.string(),
    tagline: z.string(),
    address: z.object({
      street: z.string(),
      box: z.string(),
      postalCode: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    email: z.email(),
    phone: z.string(),
    linkedin: z.url(),
  }),
});

export const collections = { pages, site };
