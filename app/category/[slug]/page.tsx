import { popularItems } from '@/data/CategoryData';
import { actualProposition } from '@/data/actualProposition.generated';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryList from '@/components/CategoryList';
import { Grid, LayoutList } from 'lucide-react';
import type { Metadata } from 'next';

const ITEMS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug;

  return {
    title: `${slug} – Категорія | MobiStuff`,
    description: `Оберіть найкращі ${slug} з нашого каталогу.`,
  };
}

export async function generateStaticParams() {
  return popularItems.map((item) => ({
    slug: item.slug,
  }));
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string; cols?: string };
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

  const cols = searchParams?.cols === '2' ? 2 : 1;

  return (
    <section>
      <div className="text-sm mb-4 text-gray-500">
        <Link href="/" className="hover:underline">
          Головна
        </Link>{' '}
        / <span className="font-semibold text-gray-700">{category.title}</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">{category.title}</h1>
      <p className="text-gray-600 mb-6">
        Оберіть з найкращих товарів у категорії{' '}
        <span className="font-semibold">&quot;{category.title}&quot;</span>
      </p>

      <div className="md:hidden mb-4 flex items-center gap-2">
        <Link
          href={`/category/${params.slug}?page=${currentPage}&cols=1`}
          className={`flex items-center gap-1 px-3 py-1 border rounded shadow-sm text-sm ${
            cols === 1 ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          <LayoutList size={16} />1 в ряд
        </Link>
        <Link
          href={`/category/${params.slug}?page=${currentPage}&cols=2`}
          className={`flex items-center gap-1 px-3 py-1 border rounded shadow-sm text-sm ${
            cols === 2 ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          <Grid size={16} />2 в ряд
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        <aside className="hidden md:block border px-4 py-4 shadow-sm rounded bg-white h-fit sticky top-24 z-30">
          <h3 className="text-lg font-semibold mb-4">Каталог</h3>
          <CategoryList />
        </aside>

        <div className="flex flex-col gap-6">
          <div
            className={`grid gap-4 ${
              cols === 1 ? 'grid-cols-1' : 'grid-cols-2'
            } sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`}
          >
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

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 flex-wrap gap-2">
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                const pageUrl = `/category/${params.slug}?page=${page}&cols=${cols}`;
                return (
                  <Link
                    key={i}
                    href={pageUrl}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
