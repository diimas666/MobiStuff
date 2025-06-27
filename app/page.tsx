import { popularItems } from '@/data/categoryData';
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
import TrendingSlider from '@/components/TrendingSlider';
//  data
import { trendingProducts } from '@/data/trendingSlider';
export default function GeneralPage() {
  return (
    <main className="text-md flex  gap-2">
      <aside className="w-[300px] border px-2 shadow-sm relative hidden md:block ">
        <h3 className="text-lg font-semibold mb-2 ">Каталог</h3>
        <CategoryList />
      </aside>
      <section className="flex w-full gap-5 max-[890px]:flex-col">
        <div className="basis-1/2 flex-1 border">
          <CategoryGrid title="Популярні категорії" items={popularItems} />
        </div>
        <div className="basis-1/2 flex-1 p-4 border lg:h-[490px] md:h-[370px]">
          <h3 className="text-xl font-semibold mb-4 ">Трендові товари</h3>
          <TrendingSlider products={trendingProducts} />
        </div>
      </section>
    </main>
  );
}
