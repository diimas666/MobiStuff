import type { Metadata } from 'next';
import Link from 'next/link';
import { catalogCategory } from '@/data/catalogCategory';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductList from '@/components/ProductList';
import ProductShelf from '@/components/ProductShelf';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import PromoCards from '@/components/PromoCards';
import SaleCountdown from '@/components/SaleCountdown';
import { getHits, getPromotions, getSaleProducts } from '@/lib/storefront';
import { plural, productForms } from '@/lib/format';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Акції та знижки на аксесуари',
  description: 'Товари зі знижкою: зарядки, кабелі, навушники, павербанки та інше. Доставка Новою Поштою 1–3 дні, оплата при отриманні.',
  alternates: { canonical: '/sale' },
};

export default async function SalePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const activeCategory = category && catalogCategory.some((c) => c.slug === category) ? category : undefined;

  const [all, products, promotions, hits] = await Promise.all([
    getSaleProducts(200),
    getSaleProducts(120, activeCategory),
    getPromotions(),
    getHits(16),
  ]);

  // Категорії, у яких зараз є знижки
  const withSale = catalogCategory.filter((c) => all.some((p) => p.categorySlug === c.slug));

  return (
    <div className="space-y-14 sm:space-y-20">
      <div>
        <Breadcrumbs items={[{ label: 'Головна', href: '/' }, { label: 'Акції' }]} />
        <header className="max-w-3xl">
          <h1 className="display-xl">Акції.</h1>
          <p className="lead mt-4">
            {all.length > 0
              ? `${all.length} ${plural(all.length, productForms)} зі знижкою. Ціни діють, поки товар є в наявності.`
              : 'Зараз знижок немає — загляньте пізніше або подивіться хіти продажу.'}
          </p>
          {all.length > 0 && <SaleCountdown className="mt-5" />}
        </header>
      </div>

      {promotions.length > 0 && <PromoCards promotions={promotions} />}

      {all.length > 0 && (
        <section>
          {withSale.length > 1 && (
            <nav aria-label="Категорії зі знижками" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Link href="/sale" scroll={false} className={`chip ${!activeCategory ? 'chip-active' : ''}`}>
                Усі
              </Link>
              {withSale.map((c) => (
                <Link key={c.slug} href={`/sale?category=${c.slug}`} scroll={false} className={`chip ${activeCategory === c.slug ? 'chip-active' : ''}`}>
                  {c.title}
                </Link>
              ))}
            </nav>
          )}
          <ProductList products={products} colVariant="2" wide />
        </section>
      )}

      {hits.length > 0 && (
        <section>
          <HomeSectionTitle title="Хіти продажу" subtitle="Беруть найчастіше." />
          <ProductShelf products={hits} />
        </section>
      )}
    </div>
  );
}
