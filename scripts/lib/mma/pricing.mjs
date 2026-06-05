import { isCableCategory } from './categoryMap.mjs';

const DEFAULT_MARKUP = 1.4;
const CABLE_MARKUP = 1.8;

export function getUsdRate() {
  const rate = Number(process.env.MMA_USD_RATE || 42);
  return rate > 0 ? rate : 42;
}

/** Оптовая цена MMA приходит в USD — конвертируем в грн */
export function toUah(usdPrice) {
  if (!usdPrice || usdPrice <= 0) return null;
  return Math.ceil(usdPrice * getUsdRate());
}

export function applyMarkup(sourcePriceUsd, { categorySlug, subcategorySlug, breadcrumbs }) {
  const baseUah = toUah(sourcePriceUsd);
  if (!baseUah) return null;

  const markup = isCableCategory(categorySlug, subcategorySlug, breadcrumbs)
    ? CABLE_MARKUP
    : DEFAULT_MARKUP;

  return Math.ceil(baseUah * markup);
}

export function getMarkupPercent(categorySlug, subcategorySlug, breadcrumbs) {
  return isCableCategory(categorySlug, subcategorySlug, breadcrumbs) ? 80 : 40;
}
