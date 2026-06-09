import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductsByBrand } from '@/lib/mongo/products';
import { brands } from '@/data/brands';
import ProductList from '@/components/ProductList';
import CategoryList from '@/components/CategoryList';
import BrandPageHeader from '@/components/BrandPageHeader';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import EcommerceTracker from '@/components/EcommerceTracker';

export function generateStaticParams() {
  return brands.map((brand) => ({
    handle: brand.handle,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );

  if (!brand) return { title: 'Бренд не знайдено' };

  return {
    title: `${brand.title} – товари бренду | MobiStuff`,
    description: brand.description?.[0] || `Купити товари ${brand.title} в MobiStuff`,
  };
}

function PaginationLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'border-green-500 bg-green-500 text-white'
          : 'border-gray-200 text-gray-700 hover:border-green-300 hover:text-green-700'
      }`}
    >
      {children}
    </Link>
  );
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const perPage = 20;

  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );

  if (!brand) return notFound();

  const { products, total } = await getProductsByBrand(
    brand.title,
    page,
    perPage
  );

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <EcommerceTracker
        event="view_item_list"
        products={products}
        listName={brand.title}
        listId={`brand/${handle}`}
      />

      <BrandPageHeader brandTitle={brand.title} productCount={total} />

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative h-36 sm:h-44">
          {brand.imageFull ? (
            <Image
              src={brand.imageFull}
              alt={brand.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/75 to-green-900/55" />
          <div className="absolute inset-0 flex items-center gap-4 px-5 sm:px-8">
            <div className="relative h-16 w-16 shrink-0 rounded-xl bg-white p-2 shadow-lg sm:h-20 sm:w-20">
              <Image
                src={brand.image}
                alt={brand.title}
                fill
                className="object-contain p-1"
                sizes="80px"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-400">
                Бренд
              </p>
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                {brand.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {page === 1 && (brand.description?.length || brand.products?.length) ? (
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <HomeSectionTitle title={`Про бренд ${brand.title}`} />
          {Array.isArray(brand.description) &&
            brand.description.map((paragraph, index) => (
              <p key={index} className="mb-3 text-sm leading-relaxed text-gray-600 last:mb-0">
                {paragraph}
              </p>
            ))}
          {Array.isArray(brand.products) && brand.products.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              {brand.products.map((item, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm leading-relaxed text-gray-600"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px_1fr] sm:gap-6">
        <aside className="sticky top-24 hidden h-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:block">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-6 w-1 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Каталог</h2>
          </div>
          <CategoryList />
        </aside>

        <section>
          <ProductList products={products} />

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <PaginationLink href={`/brand/${handle}?page=${page - 1}`}>
                  ← Попередня
                </PaginationLink>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .map((p, i, arr) => {
                  const prev = arr[i - 1];
                  const showDots = prev && p - prev > 1;

                  return [
                    showDots ? (
                      <span key={`dots-${p}`} className="px-1 text-gray-400">
                        …
                      </span>
                    ) : null,
                    <PaginationLink
                      key={`page-${p}`}
                      href={`/brand/${handle}?page=${p}`}
                      active={page === p}
                    >
                      {p}
                    </PaginationLink>,
                  ];
                })}

              {page < totalPages && (
                <PaginationLink href={`/brand/${handle}?page=${page + 1}`}>
                  Наступна →
                </PaginationLink>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
