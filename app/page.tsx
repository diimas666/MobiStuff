import type { Metadata } from 'next';
import { popularItems } from '@/data/popularAndTrending';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
//  data

import BrandList from '@/components/BrandList';
import OffersSection from '@/components/OffersSection.client';
// функция
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { getTrendingProducts } from '@/lib/getTrendingProducts';
import PromoSlider from '@/components/PromoSlider';
export const dynamic = 'force-dynamic'; // 🔥 отключает кеш
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
  // тренд
  const trending = await getTrendingProducts();
  console.log('🔥 Трендові товари:', trending.length);

  // ⚙️ Получаем данные из MongoDB
  const headphones = await getProductsByCategory(
    'navushnyky',
    'usi-navushnyky'
  );
  const powerbanks = await getProductsByCategory(
    'akumulyatory-ta-powerbank',
    'paverbanky'
  );

  const cables = await getProductsByCategory('zaryadky-ta-kabeli');
  const chargers = await getProductsByCategory(
    'zaryadky-ta-kabeli',
    'bezdrotovi-zaryadni-prystroyi'
  );
  const mice = await getProductsByCategory('kompyuterna-peryferiya', 'myshky');
  const holders = await getProductsByCategory(
    'avtomobilna-tematyka',
    'trymachi'
  );
  const speakers = await getProductsByCategory('audio-ta-video', 'kolonky');
  const watches = await getProductsByCategory('gadzhety', 'smart-hodynnyky');
  const cases = await getProductsByCategory('chokhly', 'dlia-iphone');
  const films = await getProductsByCategory('zakhyst-ekranu', 'plivky');

  // ✅ Формируем секции динамически
  const featuredSections = [
    {
      title: 'Навушники',
      categorySlug: 'navushnyky',
      subcategorySlug: 'usi-navushnyky',
      products: headphones,
    },
    {
      title: 'Павербанки',
      categorySlug: 'akumulyatory-ta-powerbank',
      subcategorySlug: 'paverbanky',
      products: powerbanks,
    },
    {
      title: 'USB кабелі',
      categorySlug: 'zaryadky-ta-kabeli',
      subcategorySlug: 'lightning',
      products: cables,
    },
    {
      title: 'Бездротові зарядні пристрої',
      categorySlug: 'zaryadky-ta-kabeli',
      subcategorySlug: 'bezdrotovi-zaryadni-prystroyi',
      products: chargers,
    },
    {
      title: 'Мишки',
      categorySlug: 'kompyuterna-peryferiya',
      subcategorySlug: 'myshky',
      products: mice,
    },
    {
      title: 'Тримачі в авто',
      categorySlug: 'avtomobilna-tematyka',
      subcategorySlug: 'trymachi',
      products: holders,
    },
    {
      title: 'Колонки',
      categorySlug: 'audio-ta-video',
      subcategorySlug: 'kolonky',
      products: speakers,
    },
    {
      title: 'Смарт-годинники',
      categorySlug: 'gadzhety',
      subcategorySlug: 'smart-hodynnyky',
      products: watches,
    },
    {
      title: 'Чохли для iPhone',
      categorySlug: 'chokhly',
      subcategorySlug: 'dlia-iphone',
      products: cases,
    },
    {
      title: 'Плівки на екран',
      categorySlug: 'zakhyst-ekranu',
      subcategorySlug: 'plivky',
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
        {/* Популярні категорії */}
        <h1 className="sr-only">
          Інтернет-магазин мобільних аксесуарів — MobiStuff
        </h1>

        <section className="flex w-full gap-5 max-[890px]:flex-col max-[658px]:gap-3 section-bottom">
          <div className="basis-1/2 flex-1 ">
            <CategoryGrid title="Популярні категорії" items={popularItems} />
          </div>
          {/* Трендові товари */}
          <div className="basis-1/2 flex-1   lg:h-[490px] md:h-[370px]">
            <h3 className="text-xl font-semibold mb-6 ">Трендові товари</h3>
            <TrendingSlider products={trending} />
          </div>
        </section>
      </main>
      <main>
        {/* Актуальні пропозиції' */}
        <section className="section-bottom">
          <div className="w-full pb-6">
            <h2 className="text-xl font-bold mb-4">Актуальні пропозиції</h2>
            <PromoSlider />
          </div>
        </section>
        {/* текст  */}
        <section className="section-bottom">
          <div className="text-gray-600 max-w-3xl mx-auto text-center mb-8 text-[18px]">
            MobiStuff — інтернет-магазин мобільних аксесуарів. Ми пропонуємо
            павербанки, зарядні пристрої, навушники, кабелі, чохли,
            смарт-годинники та інші гаджети з доставкою по всій Україні. Якість,
            гарантія, швидка доставка.
          </div>
        </section>

        {/* Популярні бренди */}
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
// hello