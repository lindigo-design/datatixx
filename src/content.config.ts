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

/** Зовнішнє посилання: порожньо або лише https:// (жодних javascript: у href). */
const link = z.union([
  z.literal(''),
  z.url({ protocol: /^https$/, error: 'Потрібне посилання https://…' }),
]);

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
            linkedin: link,
            x: link,
            dribbble: link,
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

// ---------- Platform ----------
const platform = defineCollection({
  loader: glob({ pattern: '*/platform.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: z.object({
      label: z.string(),
      title: z.string(),
      lead: z.string(),
      imageAlt: z.string(),
      ...twoCtas,
    }),
    cascade: z.object({
      ...titled,
      lead: z.string(),
      imageAlt: z.string(),
      steps: z.array(
        z.object({ title: z.string(), text: z.string(), badge: z.string() })
      ),
    }),
    scale: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      ...twoCtas,
      stats: z.array(z.object({ value: z.string(), caption: z.string() })),
    }),
    vision: z.object({
      ...titled,
      lead: z.string(),
      text: z.string(),
      cta: z.string(),
      imageAlt: z.string(),
    }),
    impact: z.object({
      ...titled,
      lead: z.string(),
      stats: z.array(
        z.object({ value: z.string(), caption: z.string(), source: z.string() })
      ),
      text: z.string(),
      sources: z.array(z.string()),
    }),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
  }),
});

// ---------- Benefits ----------
const benefits = defineCollection({
  loader: glob({ pattern: '*/benefits.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: z.object({
      label: z.string(),
      title: z.string(),
      lead: z.string(),
      imageAlt: z.string(),
      ...twoCtas,
    }),
    method: z.object({
      ...titled,
      titleEnd: z.string(),
      pillars: z.array(
        z.object({ tag: z.string(), title: z.string(), text: z.string() })
      ),
    }),
    audiences: z.object({
      ...titled,
      lead: z.string(),
      cards: z.array(
        z.object({ tag: z.string(), title: z.string(), text: z.string() })
      ),
      wide: z.object({
        tag: z.string(),
        title: z.string(),
        text: z.string(),
        indexes: z.array(z.object({ name: z.string(), value: z.string() })),
      }),
    }),
    cta: z.object({ title: z.string(), text: z.string(), button: z.string() }),
  }),
});

// ---------- Partners ----------
const heroSchema = z.object({
  label: z.string(),
  title: z.string(),
  lead: z.string(),
  imageAlt: z.string(),
  ...twoCtas,
});
const ctaSchema = z.object({
  title: z.string(),
  text: z.string(),
  button: z.string(),
});
const card = z.object({ title: z.string(), text: z.string() });

const partners = defineCollection({
  loader: glob({ pattern: '*/partners.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: heroSchema,
    chambers: z.object({
      ...titled,
      lead: z.string(),
      text: z.string(),
      cta: z.string(),
    }),
    lsp: z.object({
      ...titled,
      titleEnd: z.string(),
      lead: z.string(),
      cards: z.array(card),
    }),
    form: z.object({ ...titled, lead: z.string() }),
    cta: ctaSchema,
  }),
});

// ---------- Partners — Chambers ----------
const chambers = defineCollection({
  loader: glob({ pattern: '*/chambers.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: heroSchema,
    ways: z.object({
      ...titled,
      titleEnd: z.string(),
      lead: z.string(),
      pillars: z.array(
        z.object({
          tag: z.string(),
          title: z.string(),
          text: z.string(),
          vizCaption: z.string(),
          vizTag: z.string(),
        })
      ),
      moreTitle: z.string(),
      more: z.array(card),
    }),
    outcomes: z.object({
      ...titled,
      stats: z.array(z.object({ value: z.string(), caption: z.string() })),
      note: z.string(),
      text: z.string(),
    }),
    revenue: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      stats: z.array(z.object({ value: z.string(), caption: z.string() })),
    }),
    survey: z.object({ ...titled, text: z.string() }),
  }),
});

// ---------- Team ----------
const team = defineCollection({
  loader: glob({ pattern: '*/team.json', base: './src/content/pages' }),
  schema: ({ image }) =>
    z.object({
      ...seo,
      hero: heroSchema,
      origin: z.object({
        label: z.string(),
        lead: z.string(),
        text: z.string(),
        punchline: z.string(),
      }),
      members: z.array(
        z.object({
          name: z.string(),
          role: z.string(),
          photo: image(),
          photoAlt: z.string(),
          bio: z.string(),
          linkedin: link,
        })
      ),
      cta: ctaSchema,
    }),
});

// ---------- Contact ----------
const contact = defineCollection({
  loader: glob({ pattern: '*/contact.json', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: z.object({ label: z.string(), title: z.string(), lead: z.string() }),
    map: z.object({ lat: z.number(), lon: z.number() }),
    // Блок під формою: «Becoming a DataTixx territorial representative?»
    territorial: z.object({ title: z.string(), text: z.string() }),
    faq: z.object({
      ...titled,
      button: z.string(),
      items: z.array(
        z.object({ tag: z.string(), q: z.string(), a: z.string() })
      ),
    }),
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
    loginUrl: link,
    showLogin: z.boolean(),
    social: z.object({
      linkedin: link,
      x: link,
      facebook: link,
      instagram: link,
      youtube: link,
    }),
    ticker: z.array(
      z.object({ name: z.string(), value: z.number(), change: z.number() })
    ),
  }),
});

export const collections = {
  home,
  about,
  platform,
  benefits,
  partners,
  chambers,
  team,
  contact,
  site,
};
