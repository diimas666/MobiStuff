import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
// import ProductCard from '@/components/ProductCard';
import ProductList from '@/components/ProductList';
import FilterBar from '@/components/FilterBar';
import CategorySeoArticle from '@/components/CategorySeoArticle';
import CategoryList from '@/components/CategoryList';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import FilterSheet from '@/components/FilterSheet';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LayoutGrid, Square } from 'lucide-react';
import { plural, productForms } from '@/lib/format';
// фетч
import { fetchProducts, fetchProductFacets } from '@/lib/api';
import EcommerceTracker from '@/components/EcommerceTracker';
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
    phone?: string;
    minPrice?: string;
    maxPrice?: string;
    isTrending?: string;
    onSale?: string;
    sort?: string;
  }>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const { page, cols, brand, phone, minPrice, maxPrice, isTrending, onSale, sort } =
    searchParams;
  const filters = { brand, phone, minPrice, maxPrice, isTrending, onSale, sort };

  const { slug, sub } = params;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return notFound();
  const filterQuery = new URLSearchParams();
  if (brand) filterQuery.set('brand', brand);
  if (phone) filterQuery.set('phone', phone);
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

  const activeCount = [brand, phone, minPrice || maxPrice, isTrending, onSale, sort].filter(Boolean).length;
  const total = facets?.count ?? allProducts.length;
  const filterBar = (
    <FilterBar
      availableBrands={facets.brands}
      availablePhoneModels={facets.phoneModels}
      priceBounds={{ min: facets.minPrice, max: facets.maxPrice }}
    />
  );
  const colsHref = (c: '1' | '2') => `/category/${slug}/${sub}?page=${currentPage}&cols=${c}${queryString}`;

  return (
    <div>
      <EcommerceTracker
        event="view_item_list"
        products={paginatedProducts}
        listName={subcategory.title}
        listId={`${slug}/${sub}`}
      />

      <Breadcrumbs
        items={[
          { label: 'Головна', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: category.title, href: `/category/${slug}/${category.subcategories[0]?.slug ?? sub}` },
          { label: subcategory.title },
        ]}
      />

      <header className="mb-6 sm:mb-8">
        <h1 className="display-lg">{subcategory.title}</h1>
        <p className="mt-2 text-[15px] text-ink-2">
          {category.title}
          {total > 0 ? `, ${total} ${plural(total, productForms)}` : ''}
        </p>
      </header>

      {/* Підкатегорії */}
      {category.subcategories.length > 1 && (
        <nav aria-label="Підкатегорії" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          {category.subcategories.map((s) => (
            <Link
              key={s.slug}
              href={`/category/${slug}/${s.slug}`}
              className={`chip ${s.slug === sub ? 'chip-active' : ''}`}
              aria-current={s.slug === sub ? 'page' : undefined}
            >
              {s.title}
            </Link>
          ))}
        </nav>
      )}

      {/* Панель інструментів (мобільний) */}
      <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
        <FilterSheet activeCount={activeCount}>{filterBar}</FilterSheet>
        <div className="flex rounded-full bg-white p-1" role="group" aria-label="Вигляд сітки">
          <Link
            href={colsHref('1')}
            aria-label="Один товар у ряд"
            aria-pressed={colVariant === '1'}
            className={`flex h-8 w-9 items-center justify-center rounded-full transition ${colVariant === '1' ? 'bg-ink text-white' : 'text-ink-2'}`}
          >
            <Square className="h-4 w-4" />
          </Link>
          <Link
            href={colsHref('2')}
            aria-label="Два товари в ряд"
            aria-pressed={colVariant === '2'}
            className={`flex h-8 w-9 items-center justify-center rounded-full transition ${colVariant === '2' ? 'bg-ink text-white' : 'text-ink-2'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] lg:gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <div className="panel p-5">
              <h2 className="mb-4 text-lg font-semibold tracking-tight">Фільтри</h2>
              {filterBar}
            </div>
            <details className="panel group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold">
                Усі категорії
                <span className="text-ink-3 transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="mt-4">
                <CategoryList />
              </div>
            </details>
          </div>
        </aside>

        <div className="min-w-0">
          <ProductList products={paginatedProducts} colVariant={colVariant} />
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            hrefFor={(p) => `/category/${slug}/${sub}?page=${p}&cols=${colVariant}${queryString}`}
          />
        </div>
      </div>

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
