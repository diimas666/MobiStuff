import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/app/api/models/Product";
import { catalogCategory } from "@/data/catalogCategory";
import { isMisclassifiedInCategory } from "@/lib/productCategoryRules";

const FALLBACK_IMAGE = '/images/headphones-bg-white.webp';

export type CatalogSubcategoryItem = {
  title: string;
  image: string;
  categorySlug: string;
  subcategorySlug: string;
};

export type CatalogSection = {
  title: string;
  slug: string;
  items: CatalogSubcategoryItem[];
};

type CoverRow = { _id: string; image: string; title: string; categorySlug: string };

async function loadCovers(subcategorySlugs: string[]): Promise<CoverRow[]> {
  await dbConnect();
  return ProductModel.aggregate([
    {
      $match: {
        subcategorySlug: { $in: subcategorySlugs },
        inStock: { $ne: false },
        title: { $not: /образец/i },
        image: { $exists: true, $nin: ["", null] },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$subcategorySlug",
        image: { $first: "$image" },
        title: { $first: "$title" },
        categorySlug: { $first: "$categorySlug" },
      },
    },
  ]);
}

export async function getCatalogSections(): Promise<CatalogSection[]> {
  const subcategorySlugs = catalogCategory.flatMap((cat) => cat.subcategories.map((sub) => sub.slug));

  // Якщо база недоступна (напр. під час збірки) — каталог без фото, сторінка оновиться пізніше
  const covers = await loadCovers(subcategorySlugs).catch((error) => {
    console.error('getCatalogSections: база недоступна, показуємо каталог без фото', error?.message);
    return [] as CoverRow[];
  });

  const coverMap = new Map(
    covers.map((row) => [
      row._id as string,
      {
        image: row.image as string,
        title: row.title as string,
        categorySlug: row.categorySlug as string,
      },
    ]),
  );

  return catalogCategory.map((cat) => ({
    title: cat.title,
    slug: cat.slug,
    items: cat.subcategories.map((sub) => {
      const cover = coverMap.get(sub.slug);
      const image =
        cover && !isMisclassifiedInCategory(cover.title, cat.slug) && cover.categorySlug === cat.slug
          ? cover.image
          : FALLBACK_IMAGE;

      return {
        title: sub.title,
        image,
        categorySlug: cat.slug,
        subcategorySlug: sub.slug,
      };
    }),
  }));
}
