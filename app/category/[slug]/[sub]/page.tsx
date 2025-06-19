import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; sub: string };
}): Promise<Metadata> {
  const { slug, sub } = params;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find(
    (subcat) => subcat.slug === sub
  );

  if (!category || !subcategory) return {};

  return {
    title: `${subcategory.title} – ${category.title} | MobiStuff`,
    description: `Перегляньте підкатегорію "${subcategory.title}" у категорії "${category.title}". Знайдіть найкращі товари на MobiStuff.`,
  };
}

export default function SubcategoryPage({
  params,
}: {
  params: { slug: string; sub: string };
}) {
  const { slug, sub } = params;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find(
    (subcat) => subcat.slug === sub
  );

  if (!category || !subcategory) {
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Категорія: {category.title}</h1>
      <h2 className="text-xl text-gray-700">
        Підкатегорія: {subcategory.title}
      </h2>
    </div>
  );
}
