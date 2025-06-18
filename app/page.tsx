import { popularItems } from '@/data/categoryData'
import CategoryGrid from '@/components/CategoryGrid';
import CategoryList from '@/components/CategoryList';
export default function GeneralPage() {
  return (
    <main className="text-md flex ">
      <aside className="w-[300px] border px-2  bg-gray-100 shadow-sm relative ">
        <h3 className="text-lg font-semibold mb-2 ">Каталог</h3>
        <CategoryList/>
      </aside>
      <section className="flex w-full gap-5 max-[890px]:flex-col">
        <div className="basis-1/2 flex-1 bg-gray-100  border">
          <CategoryGrid title="Популярні категорії" items={popularItems} />
        </div>
        <div className="basis-1/2 flex-1 bg-gray-50 p-4 border">
          TREND ACTION SLIDER
        </div>
      </section>
    </main>
  );
}
