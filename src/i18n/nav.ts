// Пункти меню (бургер) і футера.
// FAQ поки веде на блок FAQ на головній (окремої сторінки ще немає).
export const mainNav = [
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  { key: 'nav.partners', path: 'partners' },
  { key: 'nav.team', path: 'team' },
  { key: 'nav.faq', path: '#faq' },
  { key: 'nav.contact', path: 'contact' },
] as const;

// Футер у макеті: About Tixx™, Tixx™ Platform, Benefits, Partners, FAQs
export const footerNav = [
  { key: 'nav.about', path: 'about' },
  { key: 'nav.platform', path: 'platform' },
  { key: 'nav.benefits', path: 'benefits' },
  { key: 'nav.partners', path: 'partners' },
  { key: 'nav.faq', path: '#faq' },
] as const;
