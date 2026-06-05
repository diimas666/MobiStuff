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

export function mapCategories(breadcrumbs = []) {
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

export function isCableCategory(categorySlug, subcategorySlug, breadcrumbs = []) {
  if (CABLE_ROOT_SLUGS.has(categorySlug)) return true;

  const haystack = [
    categorySlug,
    subcategorySlug,
    ...breadcrumbs.map((b) => b.slug || ''),
  ]
    .join(' ')
    .toLowerCase();

  return CABLE_KEYWORDS.some((kw) => haystack.includes(kw));
}
