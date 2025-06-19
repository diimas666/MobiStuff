import { popularItems } from '@/data/categoryData'
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
export default function GeneralPage() {
  return (
    <main className="text-md flex  gap-2">
      <aside className="w-[300px] border px-2 shadow-sm relative hidden md:block ">
        <h3 className="text-lg font-semibold mb-2 ">Каталог</h3>
        <CategoryList/>
      </aside>
      <section className="flex w-full gap-5 max-[890px]:flex-col">
        <div className="basis-1/2 flex-1 border">
          <CategoryGrid title="Популярні категорії" items={popularItems} />
        </div>
        <div className="basis-1/2 flex-1 p-4 border">
          TREND ACTION SLIDER
        </div>
      </section>
    </main>
  );
}
