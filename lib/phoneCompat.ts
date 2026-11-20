import { extractCompatibility, normalizePhoneModel, splitPhoneModels } from '@/lib/glassPhoneFilter';

/** Сумісність товару з телефоном покупця: true / false / null (товар універсальний або невідомо) */
export function compatibleWith(title: string, myPhone: string | null | undefined): boolean | null {
  if (!myPhone) return null;
  const compat = extractCompatibility(title);
  if (!compat) return null;
  const mine = normalizePhoneModel(myPhone).toLowerCase();
  return splitPhoneModels(compat).some((m) => m.toLowerCase() === mine);
}

/** Для яких моделей товар (для підказки «Цей чохол — для iPhone 13») */
export function compatModels(title: string): string[] {
  const compat = extractCompatibility(title);
  return compat ? splitPhoneModels(compat) : [];
}
