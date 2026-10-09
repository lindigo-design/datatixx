// Пункти меню (бургер) і футера.
// FAQ тимчасово прибрано з сайту (меню, футер і блоки на сторінках). Повернути — додати
// { key: 'nav.faq', path: '#faq' } сюди і <Faq …> на сторінки; тексти лишились у home.json.
type UiKey = keyof typeof import('./ui/en.json');
type NavItem = { key: UiKey; path: string; children?: readonly NavItem[] };

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
  { key: 'nav.team', path: 'team' },
  { key: 'nav.contact', path: 'contact' },
];

// Футер: як у макеті + сторінка для торгових палат
export const footerNav: readonly NavItem[] = [
  { key: 'nav.home', path: '' },
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  { key: 'nav.partners', path: 'partners' },
  { key: 'nav.chambers', path: 'chambers' },
];
