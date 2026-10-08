# DataTixx — сайт

Новий сайт DataTixx на [Astro](https://astro.build) (працює на Vite).
Статичні HTML-сторінки, без WordPress, без бази даних, без адмінки на сервері.

## Перший запуск (Windows)

1. Встанови **Node.js LTS** (nodejs.org), **Git** (git-scm.com) і **VS Code**.
2. Відкрий папку проєкту у VS Code → Terminal → New Terminal.
3. Встанови залежності (один раз):
   ```
   npm install
   ```
4. Запусти сайт локально:
   ```
   npm run dev
   ```
   - сайт: http://127.0.0.1:4321/en/
   - адмінка текстів і зображень: http://127.0.0.1:4321/keystatic

VS Code сам запропонує розширення Astro і Prettier — погоджуйся.

## Команди

| Команда           | Що робить                                          |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | локальний сайт + адмінка, оновлюється при зміні    |
| `npm run build`   | перевірка коду і збірка готового сайту в `dist/`   |
| `npm run preview` | перегляд зібраного сайту (як він буде на хостингу) |
| `npm run format`  | вирівняти оформлення коду (Prettier)               |

## Структура

Та сама логіка, що в шаблоні GoIT: кожна секція — окремий файл, тексти окремо від коду.

```
src/
├─ components/
│  ├─ sections/     ← секції сторінок: Header, Hero, Ticker, ContactForm, Footer
│  └─ ui/           ← дрібні елементи: Button, Logo, LanguageSwitcher, IntroLoader
├─ layouts/
│  └─ BaseLayout.astro   ← каркас сторінки: <head>, SEO, шапка, футер
├─ pages/
│  └─ [lang]/            ← сторінки для кожної мови: /en/…, /fr/…
│     ├─ index.astro     ← головна
│     ├─ contact.astro   ← контакти
│     └─ [page].astro    ← ТИМЧАСОВІ заглушки ще не зверстаних сторінок
├─ content/
│  ├─ pages/en|fr/  ← тексти сторінок (редагуються в адмінці)
│  └─ site/         ← дані компанії: адреса, email, LinkedIn
├─ i18n/
│  ├─ locales.js    ← список мов
│  ├─ ui/en|fr.json ← короткі написи інтерфейсу (меню, форма, футер)
│  └─ nav.ts        ← пункти меню
├─ styles/
│  ├─ tokens.css    ← КОЛЬОРИ, ШРИФТИ, ВІДСТУПИ з Figma — головний файл дизайну
│  ├─ reset.css, base.css, container.css, utilities.css
│  └─ global.css    ← підключає все по порядку
├─ scripts/         ← допоміжні скрипти
└─ assets/img/      ← зображення (Astro сам стискає і робить WebP/AVIF)
public/
├─ .htaccess        ← налаштування сервера IONOS: HTTPS, захист, кеш
├─ api/contact.php  ← обробник форми
└─ robots.txt, favicon.svg
keystatic.config.ts ← які поля є в адмінці
```

Стилі секції лежать усередині її `.astro`-файлу (блок `<style>`), і діють тільки на цю секцію.

## Як змінити текст

**Через адмінку:** `npm run dev` → http://127.0.0.1:4321/keystatic → змінити → Save.
**Вручну:** відкрити `src/content/pages/<мова>/<сторінка>.json`.

Далі: commit → push. Сайт оновиться сам.

## Як додати мову

1. Додати код у `src/i18n/locales.js` (наприклад `'de'`).
2. Створити `src/i18n/ui/de.json` (копія `en.json`, перекласти).
3. Створити `src/content/pages/de/` з тими самими файлами.
4. Додати імпорт словника в `src/i18n/utils.ts`.

## Безпека

- Немає бази даних і адмінки на сервері. Keystatic працює тільки на твоєму комп'ютері.
- Content-Security-Policy: браузер виконує тільки наші скрипти (Astro рахує їхні хеші).
- `.htaccess`: HTTPS, HSTS, заборона вбудовування в чужі сайти, блок старих адрес WordPress.
- Форма: пастка для ботів, перевірка часу, обмеження 5 листів на годину з однієї адреси,
  перевірка всіх полів на сервері, захист від підміни заголовків листа.
- Секрети (`config.php`, `.env`) ніколи не потрапляють у Git.
- Dependabot щотижня пропонує оновлення бібліотек.

## Форма на хостингу

На сервері IONOS: скопіювати `api/config.example.php` → `api/config.php`
і вписати справжню адресу скриньки. Без `config.php` форма відповідає помилкою.

## Що ще треба зробити

- [ ] Справжній логотип з Figma (`src/components/ui/Logo.astro`)
- [ ] Токени з Figma (`src/styles/tokens.css`)
- [ ] Тексти і секції сторінок з Figma
- [ ] Email для форми і контактів (`src/content/site/settings.json`, `config.php`)
- [ ] Значення тікера: реальні дані або підпис «ілюстрація»
- [ ] Mentions légales і політика конфіденційності
- [ ] Зображення для LinkedIn-превʼю: `public/og-image.png` (1200×630)
- [ ] Редиректи зі старих адрес WordPress (`public/.htaccess`)
- [ ] Підключення IONOS Deploy Now і домену
