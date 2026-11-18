import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductsByBrand } from '@/lib/mongo/products';
import { brands } from '@/data/brands';
import ProductList from '@/components/ProductList';
import Breadcrumbs from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import { plural, productForms } from '@/lib/format';
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

  if (!brand) return { title: 'Бренд не знайдено', robots: { index: false } };

  const url = absoluteUrl(`/brand/${brand.handle}`);
  const description = (brand.description?.[0] || `Оригінальні аксесуари ${brand.title} з доставкою по Україні.`).slice(0, 160);
  return {
    title: `${brand.title} — купити аксесуари бренду`,
    description,
    alternates: { canonical: url },
    openGraph: { url, title: `${brand.title} — аксесуари`, description },
  };
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
      <EcommerceTracker event="view_item_list" products={products} listName={brand.title} listId={`brand/${handle}`} />

      <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Каталог', href: '/catalog' }, { label: brand.title }]} />

      <section className="relative mb-10 overflow-hidden rounded-[28px] bg-ink text-white">
        {brand.imageFull ? (
          <Image src={brand.imageFull} alt="" fill sizes="100vw" className="object-cover opacity-45" priority />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative flex min-h-[260px] flex-col justify-end gap-5 p-6 sm:min-h-[340px] sm:p-12">
          <div className="relative h-16 w-28 rounded-2xl bg-white p-3 sm:h-20 sm:w-36">
            <Image src={brand.image} alt={brand.title} fill className="object-contain p-2.5" sizes="144px" priority />
          </div>
          <div>
            <h1 className="display-lg">{brand.title}</h1>
            <p className="mt-2 text-[15px] text-white/75">
              {total} {plural(total, productForms)} в каталозі
            </p>
          </div>
        </div>
      </section>

      {page === 1 && (brand.description?.length || brand.products?.length) ? (
        <section className="mb-14 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="max-w-[68ch] space-y-4 text-[16px] leading-relaxed text-ink-2">
            <h2 className="display-md mb-5 text-ink">Про {brand.title}.</h2>
            {brand.description?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
          {brand.products && brand.products.length > 0 && (
            <ul className="panel h-fit divide-y divide-line-soft px-6 text-[15px]">
              {brand.products.map((item, index) => (
                <li key={index} className="py-3.5">{item}</li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      <h2 className="display-md mb-6">Товари {brand.title}</h2>
      <ProductList products={products} wide />
      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => `/brand/${handle}?page=${p}`} />
    </div>
  );
}
