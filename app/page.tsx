import { popularItems } from '@/data/CategoryData';
import CategoryGrid from '@/components/CategoryGrid';
export default function GeneralPage() {
  return (
    <main className="text-md">
      <section className="flex gap-5 max-[890px]:flex-col">
        <div className="w-[500px] bg-gray-100 popular-category-container border ">
          <CategoryGrid title="Популярні категорії" items={popularItems} />
        </div>
        <div className="flex-1 bg-gray-50 p-4 border">TREND ACTION SLIDER</div>
      </section>
    </main>
  );
}
