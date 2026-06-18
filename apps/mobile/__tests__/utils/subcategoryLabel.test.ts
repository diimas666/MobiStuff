import { formatSubcategoryLabel } from '../../utils/subcategoryLabel';

describe('subcategoryLabel', () => {
  it('returns dictionary label for known slug', () => {
    expect(formatSubcategoryLabel('category-portativnie-batarei')).toBe(
      'Портативні батареї',
    );
  });

  it('falls back to title-cased slug words', () => {
    expect(formatSubcategoryLabel('category-akkumulyator-dlya-noutbuka')).toBe(
      'Akkumulyator Dlya Noutbuka',
    );
  });
});
