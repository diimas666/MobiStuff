import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryImages from '@/components/GalleryImages';
import Link from 'next/link';
import { catalogCategory } from '@/data/catalogCategory';
import { brands } from '@/data/brands';
import VariantSection from '@/components/VariantSection';
import OffersSection from '@/components/OffersSection.client';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductDescription from '@/components/ProductDescription';
import { stripHtml } from '@/lib/htmlUtils';
import { getRelatedProducts } from '@/lib/getRelatedProducts';
import { CARD_ONLY_FROM, FREE_DELIVERY_FROM } from '@/data/storePolicies';
import { CreditCard, PackageCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import EcommerceTracker from '@/components/EcommerceTracker';
import { formatPrice } from '@/lib/format';

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

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const inStock = product.inStock !== false;
  const brand = product.brand
    ? brands.find((b) => b.title.toLowerCase() === String(product.brand).toLowerCase())
    : undefined;
  const freeDelivery = product.price >= FREE_DELIVERY_FROM;
  const cardOnly = product.price >= CARD_ONLY_FROM;

  const perks = [
    {
      icon: Truck,
      title: 'Доставка Новою Поштою за 1–3 дні',
      text: freeDelivery ? 'Для цього товару доставка безкоштовна' : `Безкоштовно для замовлень від ${formatPrice(FREE_DELIVERY_FROM)}`,
    },
    {
      icon: CreditCard,
      title: cardOnly ? 'Оплата карткою онлайн' : 'Оплата при отриманні або карткою',
      text: cardOnly ? `Для замовлень від ${formatPrice(CARD_ONLY_FROM)} — повна передоплата` : 'Огляньте товар у відділенні перед оплатою',
    },
    { icon: RotateCcw, title: '14 днів на повернення', text: 'Якщо товар не підійшов — повернемо кошти' },
    { icon: ShieldCheck, title: 'Гарантія якості', text: 'Лише оригінальний товар від офіційних постачальників' },
  ];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images?.length ? product.images : [product.image],
    description: stripHtml(product.description || '').slice(0, 500),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'UAH',
      price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const crumbs = [
    { label: 'Головна', href: '/' },
    ...(category && subcategory
      ? [
          { label: category.title, href: `/category/${category.slug}/${subcategory.slug}` },
          { label: subcategory.title, href: `/category/${category.slug}/${subcategory.slug}` },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <>
      <EcommerceTracker event="view_item" product={product} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Breadcrumbs items={crumbs} />

      <article className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <GalleryImages images={product.images?.length ? product.images : [product.image]} title={product.title} />
        </div>

        <div className="flex flex-col gap-7 lg:pt-4">
          <header>
            <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] font-medium">
              {product.isNew && <span className="text-new">Новинка</span>}
              {brand ? (
                <Link href={`/brand/${brand.handle}`} className="text-ink-2 hover:text-ink hover:underline">
                  {brand.title}
                </Link>
              ) : product.brand ? (
                <span className="text-ink-2">{product.brand}</span>
              ) : null}
            </div>
            <h1 className="text-[28px] leading-[1.12] font-semibold tracking-[-0.025em] sm:text-[40px]">
              {product.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[28px] font-semibold tracking-tight sm:text-[32px]">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-ink-3 line-through">{formatPrice(product.oldPrice)}</span>
                  {product.discountPercent > 0 && (
                    <span className="rounded-full bg-sale px-2 py-0.5 text-[13px] font-semibold text-white">
                      −{product.discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="mt-3 flex items-center gap-2 text-[14px] text-ink-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  !inStock ? 'bg-ink-3' : product.lowStock ? 'bg-amber-500' : 'bg-accent-bright'
                }`}
              />
              {!inStock ? 'Немає в наявності' : product.lowStock ? 'Закінчується — встигніть замовити' : 'В наявності, відправимо сьогодні або завтра'}
            </p>
          </header>

          <VariantSection variants={product.variants} product={product} />

          <ul className="divide-y divide-line-soft rounded-[22px] bg-white px-5">
            {perks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4 py-4">
                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-ink" strokeWidth={1.5} />
                <div>
                  <p className="text-[15px] font-medium">{title}</p>
                  <p className="mt-0.5 text-[13px] text-ink-2">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {product.description && (
            <section className="panel p-6 sm:p-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold tracking-tight">
                <PackageCheck className="h-5 w-5 text-accent" strokeWidth={1.75} />
                Про товар
              </h2>
              <ProductDescription html={product.description} />
            </section>
          )}
        </div>
      </article>

      {relatedProducts.length > 0 && category && (
        <div className="mt-20 sm:mt-28">
          <OffersSection
            title="Схожі товари"
            subtitle={`Ще з категорії «${category.title}».`}
            products={relatedProducts}
            categorySlug={product.categorySlug}
            subcategorySlug={product.subcategorySlug}
          />
        </div>
      )}
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
