/** Єдине місце для назви та домену магазину — для перейменування змініть тут або в env */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'MobiStuff';
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://mobistuff.shop'
).replace(/\/$/, '');
export const SITE_DESCRIPTION =
  'Аксесуари для смартфонів з доставкою по Україні: навушники, зарядки, кабелі, павербанки, чохли та захисне скло. Оплата при отриманні, 14 днів на повернення.';

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/** Застосунок для iPhone (App Store) */
export const IOS_APP_ID = process.env.NEXT_PUBLIC_IOS_APP_ID || '6785212528';
export const IOS_APP_URL = IOS_APP_ID ? `https://apps.apple.com/ua/app/mobistuff/id${IOS_APP_ID}` : '';
