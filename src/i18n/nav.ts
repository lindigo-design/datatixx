// Пункти меню (бургер) і футера.
// FAQ поки веде на блок FAQ на головній (окремої сторінки ще немає).
type UiKey = keyof typeof import('./ui/en.json');
type NavItem = { key: UiKey; path: string; children?: readonly NavItem[] };

// children — підпункти (у меню показуються з відступом під батьківським пунктом)
export const mainNav: readonly NavItem[] = [
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  {
    key: 'nav.partners',
    path: 'partners',
    children: [{ key: 'nav.chambers', path: 'chambers' }],
  },
  { key: 'nav.team', path: 'team' },
  { key: 'nav.faq', path: '#faq' },
  { key: 'nav.contact', path: 'contact' },
];

// Футер: як у макеті + сторінка для торгових палат
export const footerNav: readonly NavItem[] = [
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  { key: 'nav.partners', path: 'partners' },
  { key: 'nav.chambers', path: 'chambers' },
  { key: 'nav.faq', path: '#faq' },
];
