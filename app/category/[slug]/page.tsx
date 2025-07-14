// app/category/[slug]/page.tsx
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { catalogCategory } from '@/data/catalogCategory';
import OffersSection from '@/components/OffersSection.client';
import FilterPanel from '@/components/FilterPanel'; // 👈 создадим этот компонент
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
  searchParams: { brand?: string; type?: string; sub?: string };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = params;
  const { brand, type, sub } = searchParams;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  if (!category) return notFound();

  const products = await getProductsByCategory(slug);

  // Фильтруем товары по brand / type / subcategory
  const filtered = products.filter((product) => {
    const matchBrand = brand ? product.brand === brand : true;
    const matchType = type ? product.tags?.includes(type) : true;
    const matchSub = sub ? product.subcategorySlug === sub : true;
    return matchBrand && matchType && matchSub;
  });

  const uniqueBrands: string[] = [
    ...new Set(
      products.map((p) => p.brand).filter((b): b is string => Boolean(b))
    ),
  ];

  const uniqueTags: string[] = [
    ...new Set(products.flatMap((p) => p.tags || [])),
  ];

  //   const allTags = products.flatMap((p) => p.tags || []);

  return (
    <main className=" mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{category.title}</h1>
      <div className="flex gap-6">
        <aside className="w-60">
          <FilterPanel
            categorySlug={slug}
            brands={uniqueBrands}
            types={uniqueTags}
            subcategories={category.subcategories}
            active={{ brand, type, sub }}
          />
        </aside>
        <div className="flex-1">
          <OffersSection
            title="Знайдено"
            products={filtered}
            categorySlug={slug}
          />
        </div>
      </div>
    </main>
  );
}
