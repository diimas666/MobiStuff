import {
  applyCategoryFilters,
  countActiveFilters,
  extractSubcategoryOptions,
  formatBrandLabel,
  getPriceBounds,
} from '../../utils/categoryFilters';
import { defaultCategoryFilters } from '../../types/filters';
import {
  batteryCategorySlug,
  batteryProducts,
} from '../fixtures/products';

describe('categoryFilters', () => {
  it('uses catalog titles instead of transliterated slug labels', () => {
    const options = extractSubcategoryOptions(batteryProducts, batteryCategorySlug);

    expect(options).toEqual(
      expect.arrayContaining([
        {
          id: 'category-akkumulyator-dlya-noutbuka',
          label: 'Акумулятор для ноутбука',
        },
        {
          id: 'category-akkumulyatori-dlya-telefonov',
          label: 'Акумулятори для телефонів',
        },
        {
          id: 'category-portativnie-batarei',
          label: 'Портативні батареї',
        },
      ]),
    );
  });

  it('prefers product.subcategory when API provides it', () => {
    const options = extractSubcategoryOptions(
      [
        {
          ...batteryProducts[1],
          subcategory: 'Кастомна назва',
        },
      ],
      batteryCategorySlug,
    );

    expect(options).toEqual([
      {
        id: 'category-akkumulyator-dlya-noutbuka',
        label: 'Кастомна назва',
      },
    ]);
  });

  it('filters products by selected subcategories', () => {
    const filtered = applyCategoryFilters(batteryProducts, {
      ...defaultCategoryFilters,
      subcategories: ['category-portativnie-batarei'],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].handle).toBe('power-bank');
  });

  it('counts active filter groups', () => {
    expect(
      countActiveFilters({
        ...defaultCategoryFilters,
        brands: ['Baseus'],
        subcategories: ['category-portativnie-batarei'],
        onSaleOnly: true,
      }),
    ).toBe(3);
  });

  it('calculates price bounds', () => {
    expect(getPriceBounds(batteryProducts)).toEqual({ min: 500, max: 1200 });
  });

  it('formats brand labels', () => {
    expect(formatBrandLabel('baseus')).toBe('Baseus');
    expect(formatBrandLabel('LDNIO')).toBe('LDNIO');
  });
});
