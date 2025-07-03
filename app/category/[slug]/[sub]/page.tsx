import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryList from '@/components/CategoryList';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Grid, LayoutList } from 'lucide-react';
// фетч
import { fetchProducts } from '@/lib/api';
const ITEMS_PER_PAGE = 20;

export async function generateMetadata(props: {
  params: { slug: string; sub: string };
}): Promise<Metadata> {
  const { slug, sub } = props.params;
  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);

  if (!category || !subcategory) return {};

  return {
    title:
      subcategory.seoTitle ||
      `${subcategory.title} – ${category.title} | MobiStuff`,
    description:
      subcategory.seoDescription ||
      `Перегляньте підкатегорію "${subcategory.title}" у категорії "${category.title}".`,
  };
}

export async function generateStaticParams() {
  return catalogCategory.flatMap((category) =>
    category.subcategories.map((sub) => ({
      slug: category.slug,
      sub: sub.slug,
    }))
  );
}

export default async function SubcategoryPage(props: {
  params: { slug: string; sub: string };
  searchParams: { page?: string; cols?: string };
}) {
  const { slug, sub } = props.params;
  const { page, cols } = props.searchParams;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return notFound();

  const currentPage = parseInt(page || '1', 10);
  // const colCount = cols === '2' ? 2 : 1;

  const allProducts = await fetchProducts(slug, sub);

  const colVariant = cols === '2' ? '2' : '1'; // ✅ всегда строка '1' или '2'

  // 🧮 Пагинация
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Навигация */}
      <div className="text-sm mb-4 text-gray-500">
        <Link href="/" className="hover:underline">
          Головна
        </Link>{' '}
        / <span className="font-semibold text-gray-700">{category.title}</span>
      </div>

      {/* Заголовки */}
      <h1 className="text-2xl font-bold">Категорія: {category.title}</h1>
      <h2 className="text-xl text-gray-700 mb-6">
        Підкатегорія: {subcategory.title}
      </h2>

      {/* Переключение количества карточек */}
      <div className="md:hidden mb-4 flex items-center gap-2">
        <Link
          href={`/category/${slug}/${sub}?page=${currentPage}&cols=1`}
          className={`flex items-center gap-1 px-3 py-1 border rounded shadow-sm text-sm ${
            colVariant === '1' ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          <LayoutList size={16} />1 в ряд
        </Link>
        <Link
          href={`/category/${slug}/${sub}?page=${currentPage}&cols=2`}
          className={`flex items-center gap-1 px-3 py-1 border rounded shadow-sm text-sm ${
            colVariant === '2' ? 'bg-black text-white' : 'hover:bg-gray-100'
          }`}
        >
          <Grid size={16} />2 в ряд
        </Link>
      </div>

      {/* Основная сетка */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        {/* Сайдбар */}
        <aside className="hidden md:block border px-4 py-4 shadow-sm rounded bg-white h-fit sticky top-24 z-30">
          <h3 className="text-lg font-semibold mb-4">Каталог</h3>
          <CategoryList />
        </aside>

        {/* Товары */}
        <div
          className={`grid gap-4 ${
            colVariant === '1' ? 'grid-cols-1' : 'grid-cols-2'
          } sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`}
        >
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Товари у цій підкатегорії не знайдено.
            </p>
          )}
        </div>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/category/${slug}/${sub}?page=${
                currentPage - 1
              }&cols=${cols}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              ← Попередня
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${slug}/${sub}?page=${p}&cols=${colVariant}`}
              className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                p === currentPage ? 'bg-black text-white' : ''
              }`}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link
              href={`/category/${slug}/${sub}?page=${
                currentPage + 1
              }&cols=${colVariant}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Наступна →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
