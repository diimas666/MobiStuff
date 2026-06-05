import type { Metadata } from 'next';
import { popularItems } from '@/data/popularAndTrending';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
import BrandList from '@/components/BrandList';
import OffersSection from '@/components/OffersSection.client';
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { getTrendingProducts } from '@/lib/getTrendingProducts';
import PromoSlider from '@/components/PromoSlider';

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
      <main className="text-md flex  gap-2 section-bottom">
        <aside className="w-[300px]  px-2 shadow-sm relative hidden md:block ">
          <h3 className="text-lg font-semibold mb-2 ">Каталог</h3>
          <CategoryList />
        </aside>
        <h1 className="sr-only">
          Інтернет-магазин мобільних аксесуарів — MobiStuff
        </h1>

        <section className="flex w-full gap-5 max-[890px]:flex-col max-[658px]:gap-3 section-bottom">
          <div className="basis-1/2 flex-1 ">
            <CategoryGrid title="Популярні категорії" items={popularItems} />
          </div>
          <div className="basis-1/2 flex-1   lg:h-[490px] md:h-[370px]">
            <h3 className="text-xl font-semibold mb-6 ">Трендові товари</h3>
            <TrendingSlider products={trending} />
          </div>
        </section>
      </main>
      <main>
        <section className="section-bottom">
          <div className="w-full pb-6">
            <h2 className="text-xl font-bold mb-4">Актуальні пропозиції</h2>
            <PromoSlider />
          </div>
        </section>
        <section className="section-bottom">
          <div className="text-gray-600 max-w-3xl mx-auto text-center mb-8 text-[18px]">
            MobiStuff — інтернет-магазин мобільних аксесуарів. Ми пропонуємо
            павербанки, зарядні пристрої, навушники, кабелі, чохли,
            смарт-годинники та інші гаджети з доставкою по всій Україні. Якість,
            гарантія, швидка доставка.
          </div>
        </section>

        <section className="section-bottom">
          <h3 className="text-xl font-semibold mb-6 ">Популярні бренди</h3>
          <BrandList />
        </section>

        {featuredSections.map((section) => (
          <section key={section.title} className="section-bottom">
            <div className="w-full overflow-hidden pb-6">
              <OffersSection
                title={section.title}
                products={section.products}
                categorySlug={section.categorySlug}
                subcategorySlug={section.subcategorySlug}
              />
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
