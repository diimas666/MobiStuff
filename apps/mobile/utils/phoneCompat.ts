/**
 * Сумісність аксесуара з моделлю телефону — за назвою «… for/для iPhone 15 / 15 Pro».
 * Та сама логіка, що й на сайті (lib/glassPhoneFilter.ts).
 */
export function normalizePhoneModel(value: string): string {
  return value
    .replace(/^Apple\s+/i, '')
    .replace(/\s+\d+\s*шт.*$/i, '')
    .replace(/\s+без\s+пакунку.*$/i, '')
    .replace(/\s+без\s+упаковки.*$/i, '')
    .trim();
}

export function extractCompatibility(title: string): string | null {
  const match = title.match(/\b(?:for|для)\s+(.+)$/i);
  return match ? normalizePhoneModel(match[1]) : null;
}

function inheritPrefix(first: string, segment: string): string {
  const s = segment.trim();
  if (!s) return '';
  if (/^(iPhone|Samsung|Xiaomi|Redmi|Google|Huawei|Honor|Poco|POCO|Motorola|ZTE)/i.test(s)) return normalizePhoneModel(s);
  const f = normalizePhoneModel(first);
  if (/^iPhone/i.test(f)) return normalizePhoneModel(`iPhone ${s}`);
  if (/^Samsung/i.test(f)) return normalizePhoneModel(`Samsung ${s}`);
  if (/^Xiaomi Redmi/i.test(f)) return normalizePhoneModel(`${f.replace(/\s+\S+$/, '')} ${s}`);
  if (/^Xiaomi/i.test(f)) return normalizePhoneModel(`Xiaomi ${s}`);
  return normalizePhoneModel(s);
}

export function compatModels(title: string): string[] {
  const compat = extractCompatibility(title);
  if (!compat) return [];
  const parts = compat.split(/\s*\/\s*/).map(p => p.trim()).filter(Boolean);
  return parts.map((p, i) => (i === 0 ? normalizePhoneModel(p) : inheritPrefix(parts[0], p))).filter(Boolean);
}

/** true / false / null (товар універсальний або модель не вибрана) */
export function compatibleWith(title: string, myPhone: string | null | undefined): boolean | null {
  if (!myPhone) return null;
  const models = compatModels(title);
  if (!models.length) return null;
  const mine = normalizePhoneModel(myPhone).toLowerCase();
  return models.some(m => m.toLowerCase() === mine);
}
