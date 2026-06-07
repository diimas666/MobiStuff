import type { Metadata } from 'next';
import Link from 'next/link';
import { popularItems } from '@/data/popularAndTrending';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
import BrandList from '@/components/BrandList';
import OffersSection from '@/components/OffersSection.client';
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { getTrendingProducts } from '@/lib/getTrendingProducts';
import PromoSlider from '@/components/PromoSlider';
import HomeHero from '@/components/HomeHero';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { storePolicies } from '@/data/storePolicies';
import { ArrowRight } from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Купити аксесуари для телефону в Україні | MobiStuff',
  description:
    'Широкий вибір: павербанки, навушники, зарядки, кабелі, смарт-годинники, чохли та інше. Якісні аксесуари за доступними цінами. Доставка по Україні.',
  keywords: [
    'аксесуари для телефону',
    'павербанк купити',
    'навушники bluetooth',
    'кабель lightning',
    'смарт годинник',
    'аксесуари Київ',
    'чохол iPhone',
    'зарядне бездротове',
  ],
  openGraph: {
    title: 'Купити аксесуари для телефону в Україні | MobiStuff',
    description:
      'Найкращі пропозиції на аксесуари: зарядки, кабелі, павербанки, чохли, навушники та інше. Вибір і доставка по всій Україні.',
    url: 'https://mobistuff.shop',
    siteName: 'MobiStuff',
    locale: 'uk_UA',
    type: 'website',
  },
  alternates: {
    canonical: 'https://mobistuff.shop',
  },
};

export default async function GeneralPage() {
  const [
    trending,
    headphones,
    powerbanks,
    cables,
    chargers,
    mice,
    holders,
    speakers,
    watches,
    cases,
    films,
  ] = await Promise.all([
    getTrendingProducts(),
    getProductsByCategory('category-naushniki', 'category-bluetooth-stereo-garnituri-tws'),
    getProductsByCategory('category-akkumulyatori-i-powerbank', 'category-portativnie-batarei'),
    getProductsByCategory('category-zaryadki-i-kabeli', 'category-lightning'),
    getProductsByCategory('category-zaryadki-i-kabeli', 'category-besprovodnie-zaryadnie-ustroystva'),
    getProductsByCategory('category-kompyyuternaya-periferiya', 'category-mishi'),
    getProductsByCategory('category-avtomobilynaya-tematika', 'category-avtomobilynie-derzhateli'),
    getProductsByCategory('category-audio-i-video', 'category-portativnie-kolonki'),
    getProductsByCategory('category-gadzheti', 'category-umnie-chasi-i-fitnes-trekeri'),
    getProductsByCategory('category-chehli', 'category-apple'),
    getProductsByCategory('category-zashtita-ekrana', 'category-zashtitnie-stekla'),
  ]);

  const featuredSections = [
    {
      title: 'Навушники',
      categorySlug: 'category-naushniki',
      subcategorySlug: 'category-bluetooth-stereo-garnituri-tws',
      products: headphones,
    },
    {
      title: 'Павербанки',
      categorySlug: 'category-akkumulyatori-i-powerbank',
      subcategorySlug: 'category-portativnie-batarei',
      products: powerbanks,
    },
    {
      title: 'USB кабелі',
      categorySlug: 'category-zaryadki-i-kabeli',
      subcategorySlug: 'category-lightning',
      products: cables,
    },
    {
      title: 'Бездротові зарядні пристрої',
      categorySlug: 'category-zaryadki-i-kabeli',
      subcategorySlug: 'category-besprovodnie-zaryadnie-ustroystva',
      products: chargers,
    },
    {
      title: 'Мишки',
      categorySlug: 'category-kompyyuternaya-periferiya',
      subcategorySlug: 'category-mishi',
      products: mice,
    },
    {
      title: 'Тримачі в авто',
      categorySlug: 'category-avtomobilynaya-tematika',
      subcategorySlug: 'category-avtomobilynie-derzhateli',
      products: holders,
    },
    {
      title: 'Колонки',
      categorySlug: 'category-audio-i-video',
      subcategorySlug: 'category-portativnie-kolonki',
      products: speakers,
    },
    {
      title: 'Смарт-годинники',
      categorySlug: 'category-gadzheti',
      subcategorySlug: 'category-umnie-chasi-i-fitnes-trekeri',
      products: watches,
    },
    {
      title: 'Чохли для iPhone',
      categorySlug: 'category-chehli',
      subcategorySlug: 'category-apple',
      products: cases,
    },
    {
      title: 'Плівки на екран',
      categorySlug: 'category-zashtita-ekrana',
      subcategorySlug: 'category-zashtitnie-stekla',
      products: films,
    },
  ];

  return (
    <>
      <HomeHero />

      <main className="text-md flex flex-col md:flex-row gap-4 section-bottom w-full min-w-0">
        <aside className="w-[300px] px-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm relative hidden md:block shrink-0">
          <HomeSectionTitle title="Каталог" />
          <CategoryList />
        </aside>

        <section className="flex w-full min-w-0 gap-5 items-stretch max-[890px]:flex-col max-[890px]:gap-4 section-bottom flex-1">
          <div className="basis-1/2 flex-1 flex flex-col min-h-[360px] min-w-0 max-[890px]:basis-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <HomeSectionTitle title="Популярні категорії" />
            <CategoryGrid items={popularItems} variant="home" className="flex-1" />
            <div className="sr-only">
              <h1>Інтернет-магазин мобільних аксесуарів — MobiStuff</h1>
            </div>
          </div>
          <div className="basis-1/2 flex-1 flex flex-col h-full min-w-0 max-[890px]:basis-full rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm">
            <HomeSectionTitle title="Трендові товари" subtitle="Хіти продажів цього сезону" />
            <div className="flex-1 min-h-[300px] max-[890px]:h-[260px] max-[890px]:flex-none">
              <TrendingSlider products={trending} />
            </div>
          </div>
        </section>
      </main>

      <main>
        <section className="section-bottom rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
          <HomeSectionTitle title="Актуальні пропозиції" subtitle="Акції та спеціальні умови" />
          <PromoSlider />
        </section>

        <section className="section-bottom">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 via-white to-green-50 border border-green-100 px-6 py-8 sm:px-10 sm:py-10 text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl" />
            <p className="relative text-gray-700 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              <strong className="text-gray-900">MobiStuff</strong> — інтернет-магазин мобільних
              аксесуарів. Павербанки, зарядні пристрої, навушники, кабелі, чохли, смарт-годинники
              та інші гаджети з доставкою по всій Україні. Якість, гарантія, швидка доставка.
            </p>
            <div className="relative max-w-2xl mx-auto mt-5">
              <PaymentRulesNote />
            </div>
            <div className="relative flex flex-wrap justify-center gap-3 mt-6">
              <Link
                href="/delivery"
                className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
              >
                Доставка і оплата
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/returns"
                className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
              >
                Повернення
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/about"
                className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
              >
                Про нас
              </Link>
            </div>
          </div>
        </section>

        <section className="section-bottom rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
          <HomeSectionTitle title="Популярні бренди" />
          <BrandList />
        </section>

        {featuredSections.map((section) => (
          <section
            key={section.title}
            className="section-bottom rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm"
          >
            <div className="w-full overflow-hidden pb-2">
              <OffersSection
                title={section.title}
                products={section.products}
                categorySlug={section.categorySlug}
                subcategorySlug={section.subcategorySlug}
              />
            </div>
          </section>
        ))}

        <section className="section-bottom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-6 py-8 sm:px-10">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Знайшли потрібний аксесуар?</h2>
              <p className="text-gray-300 text-sm mt-1">{storePolicies.paymentSummary}</p>
            </div>
            <Link
              href="/category/category-zaryadki-i-kabeli/category-lightning"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition shrink-0"
            >
              До каталогу
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
