const CABLE_ROOT_SLUGS = new Set(['category-zaryadki-i-kabeli']);

const CABLE_KEYWORDS = [
  'kabel',
  'lightning',
  'type-c',
  'micro-usb',
  'mini-usb',
  'aux',
  'hdmi',
  'magsafe',
];

function categoryFromTitle(title = '') {
  const haystack = title.toLowerCase();

  if (/\bколонк/.test(haystack)) {
    return {
      category: 'Аудіо та відео',
      categorySlug: 'category-audio-i-video',
      subcategorySlug: 'category-portativnie-kolonki',
    };
  }

  if (/\b(навушник|гарнітур|earbud|headphone)\b/.test(haystack)) {
    return {
      category: 'Навушники',
      categorySlug: 'category-naushniki',
      subcategorySlug: 'category-naushniki-dlya-telefona',
    };
  }

  return null;
}

export function mapCategories(breadcrumbs = [], title = '') {
  const titleOverride = categoryFromTitle(title);
  if (titleOverride) return titleOverride;

  if (!breadcrumbs.length) {
    return {
      category: 'Корисні аксесуари',
      categorySlug: 'category-poleznie-aksessuari',
      subcategorySlug: 'category-instrumenti',
    };
  }

  const root = breadcrumbs[0];
  const leaf = breadcrumbs[breadcrumbs.length - 1];

  return {
    category: root.name,
    categorySlug: root.slug,
    subcategorySlug: leaf.slug,
  };
}

function categoryHaystack(categorySlug, subcategorySlug, breadcrumbs = []) {
  return [
    categorySlug,
    subcategorySlug,
    ...breadcrumbs.map((b) => b.slug || ''),
  ]
    .join(' ')
    .toLowerCase();
}

export function isCableCategory(categorySlug, subcategorySlug, breadcrumbs = []) {
  if (CABLE_ROOT_SLUGS.has(categorySlug)) return true;
  const haystack = categoryHaystack(categorySlug, subcategorySlug, breadcrumbs);
  return CABLE_KEYWORDS.some((kw) => haystack.includes(kw));
}

/** Захисне скло — +80% */
export function isGlassCategory(categorySlug, subcategorySlug, breadcrumbs = []) {
  if (subcategorySlug === 'category-zashtitnie-stekla') return true;
  const haystack = categoryHaystack(categorySlug, subcategorySlug, breadcrumbs);
  return haystack.includes('zashtitnie-stekla');
}

/** Мишки — +50% */
export function isMiceCategory(categorySlug, subcategorySlug, breadcrumbs = []) {
  if (subcategorySlug === 'category-mishi') return true;
  const haystack = categoryHaystack(categorySlug, subcategorySlug, breadcrumbs);
  return haystack.includes('category-mishi');
}
