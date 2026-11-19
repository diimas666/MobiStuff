import { resolveUsdRate } from '../../../lib/usdRateSources.mjs';
import {
  isCableCategory,
  isGlassCategory,
  isMiceCategory,
} from './categoryMap.mjs';

const MARKUP_RULES = [
  { test: isCableCategory, multiplier: 1.8, percent: 80, label: 'кабелі/зарядки' },
  { test: isGlassCategory, multiplier: 1.8, percent: 80, label: 'захисне скло' },
  { test: isMiceCategory, multiplier: 1.5, percent: 50, label: 'мишки' },
];

const DEFAULT_MARKUP = { multiplier: 1.4, percent: 40, label: 'стандарт' };


let currentRate = null;

/** Завантажує актуальний курс (MMA → НБУ → .env). Викликати на старті скрипта. */
export async function loadUsdRate() {
  const { rate, source } = await resolveUsdRate();
  currentRate = rate;
  return { rate, source };
}

export function getUsdRate() {
  if (currentRate) return currentRate;
  const rate = Number(process.env.MMA_USD_RATE || 42);
  return rate > 0 ? rate : 42;
}

/**
 * Валюта оптової ціни MMA. Зараз MMA віддає ціни в гривнях (напр. 1439.78 грн
 * при рекомендованій роздрібній 2299 грн). Якщо колись знову будуть долари —
 * MMA_PRICE_CURRENCY=USD у .env.local.
 */
export function sourceCurrency() {
  return (process.env.MMA_PRICE_CURRENCY || 'UAH').toUpperCase() === 'USD' ? 'USD' : 'UAH';
}

/** Оптова ціна → гривні (з урахуванням валюти, в якій її збережено) */
export function toUah(price, currency = sourceCurrency()) {
  if (!price || price <= 0) return null;
  return Math.ceil(currency === 'USD' ? price * getUsdRate() : price);
}

export function getMarkupRule(categorySlug, subcategorySlug, breadcrumbs = [], title = '') {
  const rule = MARKUP_RULES.find((r) =>
    r.test(categorySlug, subcategorySlug, breadcrumbs, title)
  );
  return rule ?? DEFAULT_MARKUP;
}

export function applyMarkup(
  sourcePrice,
  { categorySlug, subcategorySlug, breadcrumbs, title },
  currency = sourceCurrency()
) {
  const baseUah = toUah(sourcePrice, currency);
  if (!baseUah) return null;

  const { multiplier } = getMarkupRule(
    categorySlug,
    subcategorySlug,
    breadcrumbs,
    title
  );
  return Math.ceil(baseUah * multiplier);
}

export function getMarkupPercent(categorySlug, subcategorySlug, breadcrumbs, title = '') {
  return getMarkupRule(categorySlug, subcategorySlug, breadcrumbs, title).percent;
}

/**
 * Роздрібна ціна з перевіркою здорового глузду: якщо після наценки ціна
 * у 1.6+ раза вища за рекомендовану роздрібну MMA — щось не так (валюта/дані),
 * беремо рекомендовану. Без оптової ціни — теж рекомендовану, без наценки.
 */
export function retailPriceFor(wholesale, rrp, context, currency = sourceCurrency()) {
  const fromWholesale = wholesale > 0 ? applyMarkup(wholesale, context, currency) : null;
  const rrpUah = rrp > 0 ? Math.ceil(rrp) : null;
  if (fromWholesale && rrpUah && fromWholesale > rrpUah * 1.6) {
    return { price: rrpUah, suspicious: true };
  }
  return { price: fromWholesale ?? rrpUah, suspicious: false };
}
