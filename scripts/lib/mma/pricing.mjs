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

export function getUsdRate() {
  const rate = Number(process.env.MMA_USD_RATE || 42);
  return rate > 0 ? rate : 42;
}

/** Оптовая цена MMA приходит в USD — конвертируем в грн */
export function toUah(usdPrice) {
  if (!usdPrice || usdPrice <= 0) return null;
  return Math.ceil(usdPrice * getUsdRate());
}

export function getMarkupRule(categorySlug, subcategorySlug, breadcrumbs = [], title = '') {
  const rule = MARKUP_RULES.find((r) =>
    r.test(categorySlug, subcategorySlug, breadcrumbs, title)
  );
  return rule ?? DEFAULT_MARKUP;
}

export function applyMarkup(
  sourcePriceUsd,
  { categorySlug, subcategorySlug, breadcrumbs, title }
) {
  const baseUah = toUah(sourcePriceUsd);
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
