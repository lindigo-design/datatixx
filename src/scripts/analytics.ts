/**
 * Google Analytics — вмикається ЛИШЕ після згоди на категорію «Analytics» у банері cookies.
 * Ідентифікатор (G-… або GT-…) — у налаштуваннях сайту (settings.json → analyticsId),
 * на сторінку потрапляє через <meta name="dtx-analytics"> у BaseLayout.
 *
 * - Немає згоди → Google не завантажується взагалі (жодного запиту, жодної cookie).
 * - Реклама (ad_storage тощо) завжди вимкнена: ми збираємо лише статистику відвідувань.
 * - Згоду відкликали (або відмовились, а cookies _ga лишились від старого сайту на WordPress) →
 *   зупиняємо збір і стираємо cookies _ga.
 */
import { getConsent, onConsent, type Choices } from '@/scripts/consent';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const id =
  document
    .querySelector<HTMLMetaElement>('meta[name="dtx-analytics"]')
    ?.content.trim() ?? '';

let loaded = false;

function load() {
  if (loaded || !id) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // gtag має передавати саме arguments — так його читає бібліотека Google
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  // CNIL: cookies аналітики — не довше 13 місяців (у Google за замовчуванням 2 роки)
  window.gtag('config', id, { cookie_expires: 13 * 30 * 24 * 60 * 60 });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
}

/** Стерти cookies Google Analytics (_ga, _ga_XXXX) на всіх варіантах домену. */
function clearCookies() {
  const host = location.hostname;
  const domains = ['', host, `.${host.replace(/^www\./, '')}`];
  for (const name of document.cookie
    .split(';')
    .map(c => c.split('=')[0].trim())) {
    if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

if (id) {
  onConsent('analytics', load);

  // Відмова або відкликання згоди
  const off = (c: Choices | null) => {
    if (c && !c.analytics) {
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
      clearCookies();
    }
  };
  off(getConsent());
  document.addEventListener('dtx:consent', e =>
    off((e as CustomEvent<Choices>).detail)
  );
}
