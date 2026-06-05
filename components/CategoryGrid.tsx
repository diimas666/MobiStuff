// components/CategoryGrid.tsx

import CategoryItem from './CategoryItem';

interface Item {
  id: number;
  title: string;
  image: string;
  bg: string;
  categorySlug: string;
  subcategorySlug: string;
}

interface CategoryGridProps {
  title: string;
  items: Item[];
}

export default function CategoryGrid({ title, items }: CategoryGridProps) {
  return (
    <section className="flex flex-col h-full">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 shrink-0">
        {title}
      </h2>
      <div
        className="
        flex-1 min-h-[300px] max-[890px]:min-h-[200px]
        gap-2
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2
        max-[578px]:flex max-[578px]:flex-row max-[578px]:overflow-x-auto
        max-[578px]:min-h-[150px] max-[578px]:pb-1 max-[578px]:snap-x max-[578px]:snap-mandatory
      "
      >
        {items.map((item, index) => (
          <CategoryItem
            key={item.id}
            title={item.title}
            image={item.image}
            bg={item.bg}
            categorySlug={item.categorySlug}
            subcategorySlug={item.subcategorySlug}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
