import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string; sub: string };
}): Promise<Metadata> {
  const slug = await params.slug;
  const sub = await params.sub;

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

/*
Берёт все категории из catalogCategory
Проходит по всем подкатегориям внутри каждой категории
Возвращает массив объектов вида:
Next.js использует этот список, чтобы создать HTML-страницы для каждого пути ещё при сборке, например:
/category/avtomobilna-tematyka/trymachi
/category/kabeli/type-c
*/

export async function generateStaticParams() {
  return catalogCategory.flatMap((category) =>
    category.subcategories.map((sub) => ({
      slug: category.slug,
      sub: sub.slug,
    }))
  );
}
export default async function SubcategoryPage({
  params,
}: {
  params: { slug: string; sub: string };
}) {
  const { slug, sub } = params;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find(
    (subcat) => subcat.slug === sub
  );

  if (!category || !subcategory) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Категорія: {category.title}</h1>
      <h2 className="text-xl text-gray-700">
        Підкатегорія: {subcategory.title}
      </h2>
    </div>
  );
}
