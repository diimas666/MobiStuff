import {
  getCatalogCategory,
  getCatalogSubcategories,
  getCatalogSubcategoryTitle,
  getCatalogSubcategoryTitleBySlug,
} from '../../utils/catalogTree';

const batteryCategorySlug = 'category-akkumulyatori-i-powerbank';
const laptopBatterySlug = 'category-akkumulyator-dlya-noutbuka';

describe('catalogTree', () => {
  it('returns category by slug', () => {
    const category = getCatalogCategory(batteryCategorySlug);

    expect(category?.title).toBe('Акумулятори та powerbank');
    expect(category?.subcategories.length).toBeGreaterThan(0);
  });

  it('returns subcategories for category', () => {
    const subcategories = getCatalogSubcategories(batteryCategorySlug);

    expect(subcategories.some(sub => sub.slug === laptopBatterySlug)).toBe(true);
  });

  it('returns localized subcategory title within category', () => {
    expect(getCatalogSubcategoryTitle(batteryCategorySlug, laptopBatterySlug)).toBe(
      'Акумулятор для ноутбука',
    );
  });

  it('finds subcategory title by slug across catalog', () => {
    expect(getCatalogSubcategoryTitleBySlug(laptopBatterySlug)).toBe(
      'Акумулятор для ноутбука',
    );
  });

  it('returns undefined for unknown slug', () => {
    expect(getCatalogSubcategoryTitleBySlug('category-unknown-slug')).toBeUndefined();
  });
});
