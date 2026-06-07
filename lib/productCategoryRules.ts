/** Товари-зразки MMA («Образец») не показуємо в каталозі */
export function isSampleProduct(title = '') {
  return /образец/i.test(title);
}

/** Назва суперечить категорії — помилка MMA або зразок */
const TITLE_BLOCKLIST_BY_CATEGORY: Record<string, RegExp[]> = {
  'category-naushniki': [/колонк/i],
  'category-portativnie-kolonki': [/навушник/i, /гарнітур/i],
};

export function isMisclassifiedInCategory(title = '', categorySlug = '') {
  const rules = TITLE_BLOCKLIST_BY_CATEGORY[categorySlug];
  if (!rules) return false;
  const haystack = title.toLowerCase();
  return rules.some((re) => re.test(haystack));
}

export function filterCatalogProducts<T extends { title?: string }>(
  products: T[],
  categorySlug?: string | null
): T[] {
  return products.filter((product) => {
    const title = product.title || '';
    if (isSampleProduct(title)) return false;
    if (categorySlug && isMisclassifiedInCategory(title, categorySlug)) return false;
    return true;
  });
}
