import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryImages from '@/components/GalleryImages';
import Link from 'next/link';
import { catalogCategory } from '@/data/catalogCategory';
import VariantSection from '@/components/VariantSection';
import OffersSection from '@/components/OffersSection.client';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { stripHtml } from '@/lib/htmlUtils';
import { getRelatedProducts } from '@/lib/getRelatedProducts';
import { CARD_ONLY_FROM } from '@/data/storePolicies';
import { ChevronRight, ShieldCheck, Truck } from 'lucide-react';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await paramsPromise;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${handle}`
  );
  const product = await res.json();

  return {
    title: product.title || 'Товар',
    description: stripHtml(product.description || ''),
  };
}

export default async function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await paramsPromise;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('❌ NEXT_PUBLIC_BASE_URL не задан');
  }

  const res = await fetch(`${baseUrl}/api/products/${handle}`);
  if (!res.ok) return notFound();

  const product = await res.json();
  const category = catalogCategory.find(
    (cat) => cat.slug === product.categorySlug
  );
  const subcategory = category?.subcategories.find(
    (sub) => sub.slug === product.subcategorySlug
  );

  const relatedProducts = product.categorySlug
    ? await getRelatedProducts(product.categorySlug, product.handle, 20)
    : [];

  const hasDiscount =
    product.oldPrice && product.oldPrice > product.price;

  return (
    <>
      <nav
        aria-label="Навігація"
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
      >
        <Link href="/" className="hover:text-green-600 transition">
          Головна
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        {category && subcategory && (
          <>
            <Link
              href={`/category/${category.slug}/${subcategory.slug}`}
              className="hover:text-green-600 transition"
            >
              {category.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </>
        )}
        <span className="font-medium text-gray-800 line-clamp-1">
          {product.title}
        </span>
      </nav>

      <article className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white lg:border-r border-gray-100">
            <GalleryImages images={product.images} title={product.title} />
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {product.isNew && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white rounded-full">
                  Новинка
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                  −{product.discountPercent}%
                </span>
              )}
              {product.inStock === false ? (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-400 text-white rounded-full">
                  Немає в наявності
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                  В наявності
                </span>
              )}
              {product.brand && (
                <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {product.brand}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {product.title}
            </h1>

            <div className="rounded-xl bg-gradient-to-r from-gray-900 via-gray-800 to-green-900 text-white px-5 py-4">
              <p className="text-sm text-gray-300 mb-1">Ціна</p>
              <div className="flex items-end gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-green-400">
                  {product.price} ₴
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through pb-1">
                    {product.oldPrice} ₴
                  </span>
                )}
              </div>
            </div>

            <VariantSection variants={product.variants} product={product} />

            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2.5 text-green-800">
                <Truck className="w-4 h-4 shrink-0 text-green-600" />
                Доставка 1–3 дні
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-100 px-3 py-2.5 text-green-800">
                <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />
                Гарантія якості
              </div>
            </div>

            {product.price >= CARD_ONLY_FROM && (
              <PaymentRulesNote />
            )}

            {product.description && (
              <section className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 sm:p-5">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-green-400 to-green-600" />
                  Опис товару
                </h2>
                <div
                  className="text-gray-600 text-sm leading-relaxed max-h-[320px] overflow-y-auto [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_p]:mb-2"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            )}
          </div>
        </div>
      </article>

      {relatedProducts.length > 0 && category && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm pb-8">
          <HomeSectionTitle
            title={`Також вас можуть зацікавити — ${category.title}`}
            subtitle="Схожі товари з цієї категорії"
          />
          <OffersSection
            title=""
            products={relatedProducts}
            categorySlug={product.categorySlug}
            subcategorySlug={product.subcategorySlug}
            compact
            hideLayoutToggle
          />
        </section>
      )}
    </>
  );
}
