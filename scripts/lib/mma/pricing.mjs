import { resolveUsdRate } from '../../../lib/usdRateSources.mjs';
import {
  isCableCategory,
  isGlassCategory,
  isMiceCategory,
} from './categoryMap.mjs';

/**
 * Наценка під ринок України (листопад 2026, звірено з Rozetka / Prom / Епіцентр):
 * дешеві аксесуари продаються з наценкою 2–3×, дорогі — 1.3–1.5×.
 * Тому множник залежить від оптової ціни, а кабелі й скло (у магазинах
 * з наценкою 2.5–4×) — трохи вище. Чохли — стандартно: на них ціни на ринку низькі.
 */
const PRICE_BANDS = [
  // [до, множник, множник для кабелів і скла]
  [30, 2.6, 3.0],
  [60, 2.2, 2.6],
  [100, 1.85, 2.1],
  [200, 1.5, 1.6],
  [500, 1.5, 1.55],
  [1000, 1.4, 1.4],
  [Infinity, 1.3, 1.3],
];
/** Мінімальний заробіток з одиниці, грн: пакування, комісія післяплати, відмови */
const MIN_PROFIT = 35;

const MARKUP_RULES = [
  { test: isCableCategory, accessory: true, label: 'кабелі/зарядки' },
  { test: isGlassCategory, accessory: true, label: 'захисне скло' },
  { test: isMiceCategory, accessory: false, label: 'мишки' },
];

const DEFAULT_MARKUP = { accessory: false, label: 'стандарт' };

/** Множник для оптової ціни (грн) */
export function multiplierFor(baseUah, rule = DEFAULT_MARKUP) {
  const band = PRICE_BANDS.find(([max]) => baseUah < max) ?? PRICE_BANDS.at(-1);
  return rule.accessory ? band[2] : band[1];
}

/** «Красива» ціна: 87 → 89, 143 → 149, 1263 → 1269 */
export function prettyPrice(n) {
  if (n < 100) return Math.ceil((n + 1) / 10) * 10 - 1;
  if (n < 1000) return Math.ceil((n + 1) / 10) * 10 - 1;
  return Math.ceil((n + 1) / 10) * 10 - 1;
}

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

  const rule = getMarkupRule(categorySlug, subcategorySlug, breadcrumbs, title);
  const raw = Math.max(baseUah * multiplierFor(baseUah, rule), baseUah + MIN_PROFIT);
  return prettyPrice(Math.ceil(raw));
}

export function getMarkupPercent(categorySlug, subcategorySlug, breadcrumbs, title = '', baseUah = 100) {
  const rule = getMarkupRule(categorySlug, subcategorySlug, breadcrumbs, title);
  return Math.round((multiplierFor(baseUah, rule) - 1) * 100);
}

/**
 * Роздрібна ціна:
 *  - з оптової за ступінчастою наценкою;
 *  - якщо є рекомендована роздрібна (РРЦ) — близько 90% РРЦ: великі магазини
 *    продають по РРЦ, ми трохи дешевше, але не демпінгуємо. Не дорожче 95% РРЦ
 *    і не дешевше за опт × 1.25 (щоб не піти в мінус);
 *  - без оптової — РРЦ.
 */
export function retailPriceFor(wholesale, rrp, context, currency = sourceCurrency()) {
  const fromWholesale = wholesale > 0 ? applyMarkup(wholesale, context, currency) : null;
  const rrpUah = rrp > 0 ? Math.ceil(rrp) : null;
  if (!fromWholesale) return { price: rrpUah, suspicious: false };
  if (!rrpUah) return { price: fromWholesale, suspicious: false };
  const baseUah = toUah(wholesale, currency);
  if (fromWholesale > rrpUah * 1.6) return { price: rrpUah, suspicious: true };
  const cap = prettyPrice(Math.floor(rrpUah * 0.95) - 1);
  const target = Math.max(fromWholesale, prettyPrice(Math.floor(rrpUah * 0.9) - 1));
  const floor = Math.ceil(baseUah * 1.25);
  return { price: Math.max(floor, Math.min(target, cap)), suspicious: false };
}
