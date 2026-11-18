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
