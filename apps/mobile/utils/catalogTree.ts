import catalogTree from '../data/catalogTree.json';

export type CatalogSubcategory = {
  title: string;
  slug: string;
};

export type CatalogCategoryNode = {
  title: string;
  slug: string;
  subcategories: CatalogSubcategory[];
};

const tree = catalogTree as CatalogCategoryNode[];

export function getCatalogCategory(slug: string): CatalogCategoryNode | undefined {
  return tree.find(item => item.slug === slug);
}

export function getCatalogSubcategories(categorySlug: string): CatalogSubcategory[] {
  return getCatalogCategory(categorySlug)?.subcategories ?? [];
}

export function getCatalogSubcategoryTitle(
  categorySlug: string,
  subcategorySlug: string,
): string | undefined {
  return getCatalogSubcategories(categorySlug).find(sub => sub.slug === subcategorySlug)?.title;
}
