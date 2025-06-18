import { popularItems } from '@/data/CategoryData';
import CategoryGrid from '@/components/CategoryGrid';
export default function GeneralPage() {
  return (
    <main className="text-md ">
      <section className="flex gap-5 max-[890px]:flex-col">
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
