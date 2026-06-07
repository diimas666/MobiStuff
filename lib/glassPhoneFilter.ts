export const GLASS_SUBCATEGORY_SLUG = 'category-zashtitnie-stekla';

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
  if (!match) return null;
  return normalizePhoneModel(match[1]);
}

function inheritPhonePrefix(firstPart: string, segment: string): string {
  const normalizedSegment = segment.trim();
  if (!normalizedSegment) return '';

  if (/^(iPhone|Samsung|Xiaomi|Redmi|Google|Huawei|Honor|Poco|POCO|Motorola|ZTE)/i.test(normalizedSegment)) {
    return normalizePhoneModel(normalizedSegment);
  }

  const first = normalizePhoneModel(firstPart);

  if (/^iPhone/i.test(first)) return normalizePhoneModel(`iPhone ${normalizedSegment}`);
  if (/^Samsung/i.test(first)) return normalizePhoneModel(`Samsung ${normalizedSegment}`);
  if (/^Xiaomi Redmi/i.test(first)) {
    const base = first.replace(/\s+\S+$/, '');
    return normalizePhoneModel(`${base} ${normalizedSegment}`);
  }
  if (/^Xiaomi/i.test(first)) return normalizePhoneModel(`Xiaomi ${normalizedSegment}`);

  return normalizePhoneModel(normalizedSegment);
}

export function splitPhoneModels(compatibility: string): string[] {
  const parts = compatibility
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return parts.map(normalizePhoneModel).filter(Boolean);
  }

  return parts
    .map((part, index) =>
      index === 0 ? normalizePhoneModel(part) : inheritPhonePrefix(parts[0], part)
    )
    .filter(Boolean);
}

export function getPhoneModelsFromTitles(titles: string[]): string[] {
  const models = new Set<string>();

  for (const title of titles) {
    const compatibility = extractCompatibility(title);
    if (!compatibility) continue;

    for (const model of splitPhoneModels(compatibility)) {
      models.add(model);
    }
  }

  return [...models].sort((a, b) => a.localeCompare(b, 'uk'));
}

export function titleMatchesPhoneModel(title: string, selectedModel: string): boolean {
  const compatibility = extractCompatibility(title);
  if (!compatibility) return false;

  const selected = normalizePhoneModel(selectedModel).toLowerCase();
  return splitPhoneModels(compatibility).some(
    (model) => model.toLowerCase() === selected
  );
}

export function getPhoneModelGroup(model: string): string {
  if (/^iPhone|^XS$|^XR$/i.test(model)) return 'Apple iPhone';
  if (/^Samsung|^Galaxy/i.test(model)) return 'Samsung';
  if (/^Xiaomi|^Redmi|^Poco|^POCO/i.test(model)) return 'Xiaomi / Redmi / POCO';
  if (/^Huawei|^Honor/i.test(model)) return 'Huawei / Honor';
  if (/^Google|^Pixel/i.test(model)) return 'Google Pixel';
  if (/^ZTE/i.test(model)) return 'ZTE';
  if (/^Motorola|^Moto/i.test(model)) return 'Motorola';
  return 'Інші моделі';
}

const GROUP_ORDER = [
  'Apple iPhone',
  'Samsung',
  'Xiaomi / Redmi / POCO',
  'Huawei / Honor',
  'Google Pixel',
  'Motorola',
  'ZTE',
  'Інші моделі',
];

export function groupPhoneModels(models: string[]): { label: string; models: string[] }[] {
  const grouped: Record<string, string[]> = {};

  for (const model of models) {
    const label = getPhoneModelGroup(model);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(model);
  }

  return GROUP_ORDER.filter((label) => grouped[label]?.length)
    .map((label) => ({
      label,
      models: grouped[label].sort((a, b) => a.localeCompare(b, 'uk')),
    }));
}
