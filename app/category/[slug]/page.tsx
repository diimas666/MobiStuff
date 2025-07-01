import { popularItems } from '@/data/categoryData';
import { actualProposition } from '@/data/actualProposition.generated';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryList from '@/components/CategoryList';
interface Params {
  slug: string;
}

interface SearchParams {
  page?: string;
}

const ITEMS_PER_PAGE = 20;

export async function generateMetadata({ params }: { params: Params }) {
  return {
    title: `${params.slug} – Категорія | MobiStuff`,
    description: `Оберіть найкращі ${params.slug} з нашого каталогу.`,
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const category = popularItems.find((item) => item.slug === params.slug);
  if (!category) return notFound();

  const filteredProducts = actualProposition.filter(
    (product) => product.categorySlug === params.slug
  );

  const currentPage = parseInt(searchParams?.page || '1', 10);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  return (
    <section>
      {/* Хлебные крошки */}
      <div className="text-sm mb-4 text-gray-500">
        <Link href="/" className="hover:underline">
          Головна
        </Link>{' '}
        / <span className="font-semibold text-gray-700">{category.title}</span>
      </div>

      {/* Заголовок */}
      <h1 className="text-3xl font-bold mb-2">{category.title}</h1>
      <p className="text-gray-600 mb-6">
        Оберіть з найкращих товарів у категорії{' '}
        <span className="font-semibold">"{category.title}"</span>.
      </p>

      {/* Основная сетка: Каталог + Товары */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 relative z-0">
        {/* Каталог (слева) */}
        <aside className="hidden md:block border px-4 py-4 shadow-sm rounded bg-white h-fit sticky top-24 overflow-visible z-10">
          <h3 className="text-lg font-semibold mb-4">Каталог</h3>
          <CategoryList />
        </aside>

        {/* Товары и пагинация */}
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                Товари у цій категорії не знайдено.
              </p>
            )}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 flex-wrap gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i}
                  href={`/category/${params.slug}?page=${i + 1}`}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
