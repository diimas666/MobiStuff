import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
// import ProductCard from '@/components/ProductCard';
import ProductList from '@/components/ProductList';
import FilterBar from '@/components/FilterBar';
import CategorySeoArticle from '@/components/CategorySeoArticle';
import CategoryList from '@/components/CategoryList';
import CategoryPageHeader from '@/components/CategoryPageHeader';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Grid, LayoutList } from 'lucide-react';
// фетч
import { fetchProducts, fetchProductFacets } from '@/lib/api';
const ITEMS_PER_PAGE = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params; // ⬅️ обязательно await

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

export default async function SubcategoryPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<{
    page?: string;
    cols?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    isTrending?: string;
    onSale?: string;
    sort?: string;
  }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { page, cols, brand, minPrice, maxPrice, isTrending, onSale, sort } =
    searchParams;
  const filters = { brand, minPrice, maxPrice, isTrending, onSale, sort };

  const { slug, sub } = params;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return notFound();
  const filterQuery = new URLSearchParams();
  if (brand) filterQuery.set('brand', brand);
  if (minPrice) filterQuery.set('minPrice', minPrice);
  if (maxPrice) filterQuery.set('maxPrice', maxPrice);
  if (isTrending) filterQuery.set('isTrending', isTrending);
  if (onSale) filterQuery.set('onSale', onSale);
  if (sort) filterQuery.set('sort', sort);
  const queryString = filterQuery.toString() ? `&${filterQuery.toString()}` : '';

  const currentPage = parseInt(page || '1', 10);
  const [allProducts, facets] = await Promise.all([
    fetchProducts(slug, sub, filters),
    fetchProductFacets(slug, sub),
  ]);

  const colVariant = cols === '1' ? '1' : '2'; // ✅ теперь по умолчанию '2'

  // 🧮 Пагинация
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);

  return (
    <div>
      <CategoryPageHeader
        categoryTitle={category.title}
        subcategoryTitle={subcategory.title}
        productCount={facets.count}
      />

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
        <aside className="hidden md:block px-4 py-4 shadow-sm rounded bg-white h-fit  z-30 w-full">
          <h3 className="text-lg font-semibold mb-4">Каталог</h3>
          <CategoryList />

          <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-medium mb-2">Фільтри</h4>
            <FilterBar
              availableBrands={facets.brands}
              priceBounds={{ min: facets.minPrice, max: facets.maxPrice }}
            />
          </div>
        </aside>

        {/* Товары */}
        <div className="w-full">
          <ProductList products={paginatedProducts} colVariant={colVariant} />
        </div>
      </div>
      {/* dmmd */}
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/category/${slug}/${sub}?page=${
                currentPage - 1
              }&cols=${cols}${queryString}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              ← Попередня
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/category/${slug}/${sub}?page=${p}&cols=${colVariant}${queryString}`}
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
              }&cols=${colVariant}${queryString}`}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Наступна →
            </Link>
          )}
        </div>
      )}

      {currentPage === 1 && (
        <CategorySeoArticle
          categorySlug={slug}
          subcategorySlug={sub}
          categoryTitle={category.title}
          subcategoryTitle={subcategory.title}
        />
      )}
    </div>
  );
}
