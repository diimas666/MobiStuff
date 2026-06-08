export function getUsdRate() {
  const rate = Number(process.env.MMA_USD_RATE || 42);
  return rate > 0 ? rate : 42;
}

export function wholesaleToUah(usdPrice?: number | null): number | null {
  if (!usdPrice || usdPrice <= 0) return null;
  return Math.ceil(usdPrice * getUsdRate());
}

/** Оцінка закупки, якщо немає MMA-ціни (стандартна наценка +40%) */
export function estimateCostFromSale(price: number): number {
  return Math.ceil(price / 1.4);
}

export function getOrderDate(order: {
  createdAt?: string | Date;
}): Date | null {
  if (!order.createdAt) return null;
  const parsed = new Date(order.createdAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const MONTH_LABELS_UK = [
  'Січ',
  'Лют',
  'Бер',
  'Кві',
  'Тра',
  'Чер',
  'Лип',
  'Сер',
  'Вер',
  'Жов',
  'Лис',
  'Гру',
] as const;

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calcConversionRate(orders: number, pageViews: number) {
  if (pageViews <= 0) return 0;
  return roundMoney((orders / pageViews) * 100);
}

export function calcMarginPercent(margin: number, revenue: number) {
  if (revenue <= 0) return 0;
  return roundMoney((margin / revenue) * 100);
}
