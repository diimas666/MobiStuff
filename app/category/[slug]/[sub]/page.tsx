import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
// import ProductCard from '@/components/ProductCard';
import ProductList from '@/components/ProductList';
import CatalogFilters from '@/components/catalog/CatalogFilters';
import MyPhoneChip from '@/components/catalog/MyPhoneChip';
import ActiveFilters, { FilteredEmpty } from '@/components/catalog/ActiveFilters';
import SortMenu from '@/components/catalog/SortMenu';
import { FilterProvider, FilterResults } from '@/components/catalog/FilterContext';
import CategorySeoArticle from '@/components/CategorySeoArticle';
import CategoryList from '@/components/CategoryList';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import FilterSheet from '@/components/FilterSheet';
import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
import Link from 'next/link';
import { ChevronDown, LayoutGrid, Square } from 'lucide-react';
import { plural, productForms } from '@/lib/format';
// фетч
import { fetchProducts, fetchProductFacets } from '@/lib/api';
import EcommerceTracker from '@/components/EcommerceTracker';
const ITEMS_PER_PAGE = 20;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; sub: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  const sp = await searchParams;

  const category = catalogCategory.find((cat) => cat.slug === slug);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);

  if (!category || !subcategory) return { title: 'Категорію не знайдено', robots: { index: false } };

  const page = Number(sp.page) || 1;
  const path = `/category/${slug}/${sub}`;
  const canonical = absoluteUrl(page > 1 ? `${path}?page=${page}` : path);
  // Сторінки з фільтрами (бренд, ціна, сортування) — не індексуємо, щоб не плодити дублікати
  const filtered = ['brand', 'phone', 'minPrice', 'maxPrice', 'sort', 'cols'].some((k) => sp[k] !== undefined);
  const title = (subcategory.seoTitle || `${subcategory.title} — купити в Україні`).replace(/\s*\|\s*MobiStuff$/i, '');
  const description =
    subcategory.seoDescription ||
    `${subcategory.title} з доставкою Новою Поштою за 1–3 дні. Оплата при отриманні, 14 днів на повернення, оригінальна продукція.`;

  return {
    title: page > 1 ? `${title} — сторінка ${page}` : title,
    description,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { type: 'website', url: canonical, title, description },
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

  const activeCount = [brand, phone, minPrice || maxPrice, isTrending, onSale].filter(Boolean).length;
  const total = facets?.count ?? allProducts.length;
  const filterBar = <CatalogFilters facets={facets} />;
  const found = allProducts.length;
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

      <FilterProvider>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] lg:gap-10">
          <aside className="hidden md:block">
            <div className="no-scrollbar sticky top-[88px] max-h-[calc(100vh-108px)] space-y-4 overflow-y-auto pb-4">
              <div className="panel p-5">{filterBar}</div>
              <details className="panel group p-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-1 text-[15px] font-semibold">
                  Усі категорії
                  <ChevronDown className="h-4 w-4 text-ink-3 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-2">
                  <CategoryList />
                </div>
              </details>
            </div>
          </aside>

          <div className="min-w-0">
            {/* Панель інструментів */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FilterSheet activeCount={activeCount} resultCount={found}>
                  {filterBar}
                </FilterSheet>
                <p className="hidden text-[15px] text-ink-2 md:block">
                  {found} {plural(found, productForms)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SortMenu />
                <div className="flex rounded-full bg-white p-1 md:hidden" role="group" aria-label="Вигляд сітки">
                  <Link
                    href={colsHref('1')}
                    scroll={false}
                    aria-label="Один товар у ряд"
                    aria-pressed={colVariant === '1'}
                    className={`flex h-8 w-9 items-center justify-center rounded-full transition ${colVariant === '1' ? 'bg-ink text-white' : 'text-ink-2'}`}
                  >
                    <Square className="h-4 w-4" />
                  </Link>
                  <Link
                    href={colsHref('2')}
                    scroll={false}
                    aria-label="Два товари в ряд"
                    aria-pressed={colVariant === '2'}
                    className={`flex h-8 w-9 items-center justify-center rounded-full transition ${colVariant === '2' ? 'bg-ink text-white' : 'text-ink-2'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <MyPhoneChip models={facets?.phoneModels ?? []} />
            <ActiveFilters />

            <FilterResults>
              <ProductList
                products={paginatedProducts}
                colVariant={colVariant}
                empty={<FilteredEmpty hasFilters={activeCount > 0} />}
              />
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                hrefFor={(p) => `/category/${slug}/${sub}?page=${p}&cols=${colVariant}${queryString}`}
              />
            </FilterResults>
          </div>
        </div>
      </FilterProvider>

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
