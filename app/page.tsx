import { popularItems } from '@/data/categoryData';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
//  data
import { trendingProducts } from '@/data/trendingSlider';
import { actualProposition } from '@/data/actualProposition';
import { headphones } from '@/data/headphones';
import OffersSection from '@/components/OffersSection.client';
import BrandList from '@/components/BrandList';
export default function GeneralPage() {
  return (
    <>
      <main className="text-md flex  gap-2 section-bottom">
        <aside className="w-[300px] border px-2 shadow-sm relative hidden md:block ">
          <h3 className="text-lg font-semibold mb-2 ">Каталог</h3>
          <CategoryList />
        </aside>
        {/* Популярні категорії */}
        <section className="flex w-full gap-5 max-[890px]:flex-col max-[658px]:gap-3 section-bottom">
          <div className="basis-1/2 flex-1 border">
            <CategoryGrid title="Популярні категорії" items={popularItems} />
          </div>
          {/* Трендові товари */}
          <div className="basis-1/2 flex-1  border lg:h-[490px] md:h-[370px]">
            <h3 className="text-xl font-semibold mb-6 ">Трендові товари</h3>
            <TrendingSlider products={trendingProducts} />
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
        {/* Навушники */}
        <section className="section-bottom">
          <div className="w-full overflow-hidden  pb-6">
            <OffersSection products={headphones} title={'Навушники'} />
          </div>
        </section>
      </main>
    </>
  );
}
