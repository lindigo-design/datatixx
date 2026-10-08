import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';

/*
  Тексти сайту. Редагуються в адмінці Keystatic або прямо в JSON.
  Файли: src/content/pages/<мова>/<сторінка>.json
*/

const seo = {
  seoTitle: z.string(),
  seoDescription: z.string().max(170),
};

const twoCtas = { primaryCta: z.string(), secondaryCta: z.string() };

// ---------- Головна ----------
const home = defineCollection({
  loader: glob({ pattern: '*/home.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      ...seo,
      hero: z.object({
        title: z.string(),
        lead: z.string(),
        imageAlt: z.string(),
        ...twoCtas,
      }),
      marquee: z.array(z.string()).min(1),
      features: z.object({
        label: z.string(),
        titleStart: z.string(),
        titleAccent: z.string(),
        subtitle: z.string(),
        items: z
          .array(z.object({ label: z.string(), text: z.string() }))
          .length(4),
      }),
      why: z.object({
        label: z.string(),
        titleLine1: z.string(),
        titleLine2: z.string(),
        lead: z.string(),
        ...twoCtas,
        cards: z.array(z.object({ title: z.string(), text: z.string() })),
        imageAlt: z.string(),
      }),
      about: z.object({
        label: z.string(),
        title: z.string(),
        text: z.string(),
        cta: z.string(),
      }),
      model: z.object({
        label: z.string(),
        title: z.string(),
        lead: z.string(),
        ...twoCtas,
        stats: z.array(z.object({ value: z.string(), caption: z.string() })),
      }),
      benefits: z.object({
        label: z.string(),
        titleStart: z.string(),
        titleAccent: z.string(),
        lead: z.string(),
        note: z.string(),
        roles: z
          .array(
            z.object({
              audience: z.string(),
              name: z.string(),
              cardTitle: z.string(),
              cardText: z.string(),
              vizCaption: z.string(),
              vizTag: z.string(),
              cases: z.array(z.string()),
            })
          )
          .length(4),
      }),
      team: z.object({
        label: z.string(),
        title: z.string(),
        intro: z.string(),
        members: z.array(
          z.object({
            name: z.string(),
            role: z.string(),
            photo: image(),
            photoAlt: z.string(),
            bio: z.string(),
            linkedin: z.string(),
            x: z.string(),
            dribbble: z.string(),
          })
        ),
      }),
      cta: z.object({
        title: z.string(),
        text: z.string(),
        button: z.string(),
      }),
      faq: z.object({
        title: z.string(),
        lead: z.string(),
        button: z.string(),
        items: z.array(z.object({ q: z.string(), a: z.string() })),
      }),
    }),
});

// ---------- About ----------
const titled = {
  label: z.string(),
  titleStart: z.string(),
  titleAccent: z.string(),
};

const about = defineCollection({
  loader: glob({ pattern: '*/about.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: z.object({
      label: z.string(),
      title: z.string(),
      lead: z.string(),
      imageAlt: z.string(),
      ...twoCtas,
    }),
    story: z.object({
      ...titled,
      subtitle: z.string(),
      acts: z.array(
        z.object({
          tag: z.string(),
          title: z.string(),
          text: z.string(),
          stamp: z.string(),
        })
      ),
    }),
    discovery: z.object({
      ...titled,
      titleEnd: z.string(),
      lead: z.string(),
      text: z.string(),
      imageAlt: z.string(),
    }),
    manifesto: z.object({
      label: z.string(),
      text: z.string(),
      signature: z.string(),
    }),
    data: z.object({
      ...titled,
      lead: z.string(),
      pillars: z.array(
        z.object({ tag: z.string(), title: z.string(), text: z.string() })
      ),
    }),
    tools: z.object({
      label: z.string(),
      titleLine1: z.string(),
      titleLine2: z.string(),
      text: z.string(),
      points: z.array(z.string()),
      ...twoCtas,
      imageAlt: z.string(),
    }),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
  }),
});

// ---------- Прості сторінки (контакти тощо) ----------
const pages = defineCollection({
  loader: glob({ pattern: '*/contact.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    title: z.string(),
    lead: z.string(),
  }),
});

// ---------- Дані компанії — одні для всіх мов ----------
const site = defineCollection({
  loader: file('./src/content/site/settings.json', {
    parser: text => ({ settings: JSON.parse(text) }),
  }),
  schema: z.object({
    companyName: z.string(),
    brandName: z.string(),
    tagline: z.string(),
    address: z.object({
      city: z.string(),
      street: z.string(),
      box: z.string(),
      postalCode: z.string(),
      country: z.string(),
    }),
    email: z.email(),
    phone: z.string(),
    loginUrl: z.string(),
    showLogin: z.boolean(),
    social: z.object({
      linkedin: z.string(),
      x: z.string(),
      facebook: z.string(),
      instagram: z.string(),
      youtube: z.string(),
    }),
    ticker: z.array(
      z.object({ name: z.string(), value: z.number(), change: z.number() })
    ),
  }),
});

export const collections = { home, about, pages, site };
