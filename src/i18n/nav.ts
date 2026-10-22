// Пункти меню (бургер) і футера.
// FAQ тимчасово прибрано з сайту (меню, футер і блоки на сторінках). Повернути — додати
// { key: 'nav.faq', path: '#faq' } сюди і <Faq …> на сторінки; тексти лишились у home.json.
type UiKey = keyof typeof import('./ui/en.json');
type NavItem = {
  key: UiKey;
  path: string;
  /** 'blog' — показувати, лише коли в цій мові є хоча б одна опублікована (не чернетка) стаття */
  requires?: 'blog';
  children?: readonly NavItem[];
};

// children — підпункти (у меню показуються з відступом під батьківським пунктом)
export const mainNav: readonly NavItem[] = [
  { key: 'nav.home', path: '' },
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  {
    key: 'nav.partners',
    path: 'partners',
    children: [{ key: 'nav.chambers', path: 'chambers' }],
  },
  { key: 'nav.blog', path: 'blog', requires: 'blog' },
  { key: 'nav.team', path: 'team' },
  { key: 'nav.contact', path: 'contact' },
];

// Футер: усі сторінки сайту (Blog — лише коли є статті)
export const footerNav: readonly NavItem[] = [
  { key: 'nav.home', path: '' },
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  {
    key: 'nav.partners',
    path: 'partners',
    children: [{ key: 'nav.chambers', path: 'chambers' }],
  },
  { key: 'nav.blog', path: 'blog', requires: 'blog' },
  { key: 'nav.team', path: 'team' },
  { key: 'nav.contact', path: 'contact' },
];
