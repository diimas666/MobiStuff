import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
import { actualProposition as allProducts } from '@/data/actualProposition.generated';

import type { Metadata } from 'next';
import ProductCard from '@/components/ProductCard';
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

  const title =
    subcategory.seoTitle ||
    `${subcategory.title} – ${category.title} | MobiStuff`;

  const description =
    subcategory.seoDescription ||
    `Перегляньте підкатегорію "${subcategory.title}" у категорії "${category.title}". Знайдіть найкращі товари на MobiStuff.`;

  return {
    title,
    description,
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

// страница
export default async function SubcategoryPage({ params, searchParams }) {
  const { slug, sub } = params;
  const page = parseInt(searchParams?.page || '1', 10);
  const perPage = 20;
  const start = (page - 1) * perPage;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find(
    (subcat) => subcat.slug === sub
  );

  const filteredProducts = allProducts.filter(
    (p) => p.categorySlug === slug && p.subcategorySlug === sub
  );
  const paginatedProducts = filteredProducts.slice(start, start + perPage);
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  if (!category || !subcategory) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">Категорія: {category.title}</h1>
      <h2 className="text-xl text-gray-700">
        Підкатегорія: {subcategory.title}
      </h2>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1 mt-6">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {paginatedProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            Товари у цій підкатегорії не знайдено.
          </p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
          {page > 1 && (
            <a
              href={`/category/${slug}/${sub}?page=${page - 1}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              ← Попередня
            </a>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
            )
            .map((p, i, arr) => {
              const prev = arr[i - 1];
              const showDots = prev && p - prev > 1;

              return (
                <div key={`page-${p}`} className="flex items-center">
                  {showDots && <span className="px-2">...</span>}
                  <a
                    href={`/category/${slug}/${sub}?page=${p}`}
                    className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                      page === p ? 'bg-black text-white' : 'text-black'
                    }`}
                  >
                    {p}
                  </a>
                </div>
              );
            })}

          {page < totalPages && (
            <a
              href={`/category/${slug}/${sub}?page=${page + 1}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Наступна →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
