export function formatPrice(value: number | string | undefined | null): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '0 ₴';
  return `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₴`;
}

/** Українська множина: plural(5, ['товар', 'товари', 'товарів']) */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export const productForms: [string, string, string] = ['товар', 'товари', 'товарів'];
