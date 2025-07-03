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
    <section>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div
        className="
        gap-2
        grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        max-[578px]:flex max-[578px]:flex-row max-[578px]:overflow-x-auto
        
      "
      >
        {items.map((item) => (
          <CategoryItem
            key={item.id}
            title={item.title}
            image={item.image}
            bg={item.bg}
            categorySlug={item.categorySlug}
            subcategorySlug={item.subcategorySlug}
          />
        ))}
      </div>
    </section>
  );
}
