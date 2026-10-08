import { config, fields, singleton } from '@keystatic/core';
import { locales } from './src/i18n/locales.js';

/*
  Адмінка для текстів і зображень.
  Відкривається тільки локально: npm run dev → http://127.0.0.1:4321/keystatic
  Зберігає зміни прямо у файли src/content/… — далі звичайний commit і push.
*/

const seo = {
  seoTitle: fields.text({
    label: 'SEO: заголовок вкладки',
    validation: { length: { min: 1, max: 70 } },
  }),
  seoDescription: fields.text({
    label: 'SEO: опис для Google',
    multiline: true,
    validation: { length: { min: 1, max: 170 } },
  }),
};

const homeSchema = {
  ...seo,
  heroLabel: fields.text({ label: 'Hero: малий лейбл (01 / …)' }),
  heroTitle: fields.text({ label: 'Hero: головний заголовок' }),
  heroLead: fields.text({ label: 'Hero: підзаголовок', multiline: true }),
  heroCta: fields.text({ label: 'Hero: текст кнопки' }),
  heroImage: fields.image({
    label: 'Hero: зображення (необовʼязково)',
    description:
      'Завантажуй звичайне фото — сайт сам стисне його і зробить версії під усі екрани.',
    directory: 'src/assets/img/hero',
    publicPath: '../../../assets/img/hero/',
  }),
  heroImageAlt: fields.text({
    label: 'Hero: опис зображення для незрячих (alt)',
  }),
  tickerItems: fields.array(
    fields.object({
      name: fields.text({ label: 'Назва індексу' }),
      change: fields.number({ label: 'Зміна, %', step: 0.01 }),
    }),
    {
      label: 'Тікер індексів',
      itemLabel: p => `${p.fields.name.value} (${p.fields.change.value}%)`,
    }
  ),
};

const contactSchema = {
  ...seo,
  title: fields.text({ label: 'Заголовок' }),
  lead: fields.text({ label: 'Вступний текст', multiline: true }),
};

const langLabel = (l: string) => l.toUpperCase();

const pageSingletons = Object.fromEntries(
  locales.flatMap(lang => [
    [
      `home_${lang}`,
      singleton({
        label: `Головна · ${langLabel(lang)}`,
        path: `src/content/pages/${lang}/home`,
        format: { data: 'json' },
        schema: homeSchema,
      }),
    ],
    [
      `contact_${lang}`,
      singleton({
        label: `Контакти · ${langLabel(lang)}`,
        path: `src/content/pages/${lang}/contact`,
        format: { data: 'json' },
        schema: contactSchema,
      }),
    ],
  ])
);

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'DataTixx — сайт' },
    navigation: {
      Компанія: ['settings'],
      Сторінки: Object.keys(pageSingletons),
    },
  },
  singletons: {
    settings: singleton({
      label: 'Дані компанії (адреса, email, соцмережі)',
      path: 'src/content/site/settings',
      format: { data: 'json' },
      schema: {
        companyName: fields.text({ label: 'Юридична назва' }),
        brandName: fields.text({ label: 'Назва продукту' }),
        tagline: fields.text({ label: 'Слоган' }),
        address: fields.object(
          {
            street: fields.text({ label: 'Вулиця' }),
            box: fields.text({ label: 'Поштова скринька (CS)' }),
            postalCode: fields.text({ label: 'Індекс' }),
            city: fields.text({ label: 'Місто' }),
            country: fields.text({ label: 'Країна' }),
          },
          { label: 'Адреса' }
        ),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Телефон (можна порожнім)' }),
        linkedin: fields.url({
          label: 'LinkedIn',
          validation: { isRequired: true },
        }),
      },
    }),
    ...pageSingletons,
  },
});
