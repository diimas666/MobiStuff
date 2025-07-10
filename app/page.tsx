import { popularItems } from '@/data/popularAndTrending';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
//  data
import { trendingProducts } from '@/data/trendingSlider';
import { actualProposition } from '@/data/actualProposition';
import BrandList from '@/components/BrandList';
import OffersSection from '@/components/OffersSection.client';
// функция
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { getTrendingProducts } from '@/lib/getTrendingProducts';

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

  const cables = await getProductsByCategory('zaryadky-ta-kabeli', 'usb');
  const mice = await getProductsByCategory('komp-yuterna-peryferiia', 'myshky');
  const holders = await getProductsByCategory(
    'avtomobilna-tematyka',
    'trymachi'
  );
  const speakers = await getProductsByCategory('audio-ta-video', 'kolonky');
  const watches = await getProductsByCategory('gadzhety', 'smart-hodynnyky');
  const cases = await getProductsByCategory('chokhly', 'dlia-iphone');
  const films = await getProductsByCategory('zakhyst-ekranu', 'plivky');
  const testers = await getProductsByCategory(
    'korysni-akcesuary',
    'kabel-testery'
  );

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
      subcategorySlug: 'usb',
      products: cables,
    },
    {
      title: 'Мишки',
      categorySlug: 'komp-yuterna-peryferiia',
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
    {
      title: 'Кабель-тестери',
      categorySlug: 'korysni-akcesuary',
      subcategorySlug: 'kabel-testery',
      products: testers,
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
          <div className="w-full overflow-hidden  pb-6">
            <OffersSection
              products={actualProposition}
              title={'Актуальні пропозиції'}
            />
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
