import { config, fields, singleton } from '@keystatic/core';
import { locales } from './src/i18n/locales.js';

/*
  Адмінка для текстів і зображень.
  Відкривається тільки локально: npm run dev → http://127.0.0.1:4321/keystatic
  Зберігає зміни прямо у файли src/content/… — далі звичайний commit і push.
*/

const text = (label: string, description?: string) =>
  fields.text({ label, description, validation: { length: { min: 1 } } });
const longText = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    multiline: true,
    validation: { length: { min: 1 } },
  });
const optional = (label: string) => fields.text({ label });

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

const twoButtons = {
  primaryCta: text('Кнопка 1 (градієнтна)'),
  secondaryCta: text('Кнопка 2 (контурна)'),
};

const homeSchema = {
  ...seo,
  hero: fields.object(
    {
      title: text('Головний заголовок'),
      lead: longText('Підзаголовок'),
      ...twoButtons,
      imageAlt: optional('Опис фото для незрячих (порожньо = декоративне)'),
    },
    { label: '1 · Hero' }
  ),
  marquee: fields.array(text('Слово / фраза'), {
    label: '2 · Біжучий рядок (use cases)',
    itemLabel: p => p.value,
  }),
  features: fields.object(
    {
      label: text('Мітка секції'),
      titleStart: text('Заголовок — біла частина'),
      titleAccent: text('Заголовок — зелена частина'),
      subtitle: text('Підзаголовок'),
      items: fields.array(
        fields.object({ label: text('Назва'), text: longText('Текст') }),
        {
          label: '4 картки',
          itemLabel: p => p.fields.label.value,
          validation: { length: { min: 4, max: 4 } },
        }
      ),
    },
    { label: '3 · Features' }
  ),
  why: fields.object(
    {
      label: text('Мітка секції'),
      titleLine1: text('Заголовок — рядок 1'),
      titleLine2: text('Заголовок — рядок 2 (градієнт)'),
      lead: longText('Підзаголовок'),
      ...twoButtons,
      cards: fields.array(
        fields.object({ title: text('Заголовок'), text: longText('Текст') }),
        {
          label: 'Картки',
          itemLabel: p => p.fields.title.value,
        }
      ),
      imageAlt: text('Опис скриншота дашборду'),
    },
    { label: '4 · Why Tixx™' }
  ),
  about: fields.object(
    {
      label: text('Мітка секції'),
      title: text('Заголовок'),
      text: longText('Текст'),
      cta: text('Кнопка'),
    },
    { label: '5 · About' }
  ),
  model: fields.object(
    {
      label: text('Мітка секції'),
      title: text('Заголовок'),
      lead: longText('Текст'),
      ...twoButtons,
      stats: fields.array(
        fields.object({ value: text('Число'), caption: text('Підпис') }),
        {
          label: 'Цифри',
          itemLabel: p => `${p.fields.value.value} — ${p.fields.caption.value}`,
        }
      ),
    },
    { label: '6 · Model / Stats' }
  ),
  benefits: fields.object(
    {
      label: text('Мітка секції'),
      titleStart: text('Заголовок — біла частина'),
      titleAccent: text('Заголовок — градієнтна частина'),
      lead: longText('Підзаголовок'),
      note: text('Примітка праворуч'),
      roles: fields.array(
        fields.object({
          audience: text('Для кого (малий підпис)'),
          name: text('Назва ролі'),
          cardTitle: text('Картка: заголовок'),
          cardText: text('Картка: текст'),
          vizCaption: text('Картка: підпис під графіком'),
          vizTag: optional('Картка: зелена мітка (необовʼязково)'),
          cases: fields.array(text('Сценарій'), {
            label: 'Сценарії',
            itemLabel: p => p.value,
          }),
        }),
        {
          label: '4 ролі',
          itemLabel: p => p.fields.name.value,
          validation: { length: { min: 4, max: 4 } },
        }
      ),
    },
    { label: '7 · Benefits by role' }
  ),
  team: fields.object(
    {
      label: text('Мітка секції'),
      title: text('Заголовок'),
      intro: text('Вступ ліворуч'),
      members: fields.array(
        fields.object({
          name: text('Імʼя'),
          role: text('Посада'),
          photo: fields.image({
            label: 'Фото',
            description:
              'Квадратне фото. Сайт сам стисне його і зробить версії під усі екрани.',
            directory: 'src/assets/img/team',
            publicPath: '../../../assets/img/team/',
            validation: { isRequired: true },
          }),
          photoAlt: text('Опис фото для незрячих'),
          bio: longText('Біографія', 'Новий абзац — з нового рядка.'),
          linkedin: optional('LinkedIn (посилання)'),
          x: optional('X (посилання)'),
          dribbble: optional('Dribbble (посилання)'),
        }),
        { label: 'Люди', itemLabel: p => p.fields.name.value }
      ),
    },
    { label: '8 · Team' }
  ),
  cta: fields.object(
    {
      title: text('Великий заголовок'),
      text: text('Текст'),
      button: text('Кнопка'),
    },
    { label: '9 · CTA' }
  ),
  faq: fields.object(
    {
      title: text('Заголовок'),
      lead: longText('Вступ'),
      button: text('Кнопка'),
      items: fields.array(
        fields.object({ q: text('Питання'), a: longText('Відповідь') }),
        {
          label: 'Питання',
          itemLabel: p => p.fields.q.value,
        }
      ),
    },
    { label: '10 · FAQ' }
  ),
};

const contactSchema = {
  ...seo,
  title: text('Заголовок'),
  lead: longText('Вступний текст'),
};

const pageSingletons = Object.fromEntries(
  locales.flatMap(lang => [
    [
      `home_${lang}`,
      singleton({
        label: `Головна · ${lang.toUpperCase()}`,
        path: `src/content/pages/${lang}/home`,
        format: { data: 'json' },
        schema: homeSchema,
      }),
    ],
    [
      `contact_${lang}`,
      singleton({
        label: `Контакти · ${lang.toUpperCase()}`,
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
      label: 'Дані компанії, соцмережі, тікер',
      path: 'src/content/site/settings',
      format: { data: 'json' },
      schema: {
        companyName: text('Юридична назва'),
        brandName: text('Назва продукту'),
        tagline: text('Слоган'),
        address: fields.object(
          {
            city: text('Місто (заголовок у футері)'),
            street: text('Вулиця'),
            box: text('Поштова скринька (CS)'),
            postalCode: text('Індекс'),
            country: text('Країна'),
          },
          { label: 'Адреса' }
        ),
        email: text('Email'),
        phone: optional('Телефон'),
        loginUrl: optional('Посилання для кнопки Login (платформа Datixxia)'),
        showLogin: fields.checkbox({
          label: 'Показувати кнопку Login',
          defaultValue: false,
        }),
        social: fields.object(
          {
            linkedin: optional('LinkedIn'),
            x: optional('X'),
            facebook: optional('Facebook'),
            instagram: optional('Instagram'),
            youtube: optional('YouTube'),
          },
          { label: 'Соцмережі (порожнє поле = іконку сховано)' }
        ),
        ticker: fields.array(
          fields.object({
            name: text('Назва індексу'),
            value: fields.number({
              label: 'Значення',
              step: 0.01,
              validation: { isRequired: true },
            }),
            change: fields.number({
              label: 'Зміна, %',
              step: 0.1,
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Тікер під навігацією',
            itemLabel: p => `${p.fields.name.value} ${p.fields.change.value}%`,
          }
        ),
      },
    }),
    ...pageSingletons,
  },
});
