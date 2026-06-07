import CategoryItem from './CategoryItem';

interface Item {
  id?: number | string;
  title: string;
  image: string;
  categorySlug: string;
  subcategorySlug: string;
}

interface CategoryGridProps {
  title?: string;
  items: Item[];
  variant?: 'home' | 'catalog';
  className?: string;
}

export default function CategoryGrid({
  title,
  items,
  variant = 'home',
  className = '',
}: CategoryGridProps) {
  const gridClass =
    variant === 'catalog'
      ? `
        grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3
        max-[578px]:flex max-[578px]:flex-row max-[578px]:overflow-x-auto
        max-[578px]:pb-1 max-[578px]:snap-x max-[578px]:snap-mandatory
      `
      : `
        grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-2 flex-1 h-full min-h-[300px]
        max-[578px]:flex max-[578px]:flex-row max-[578px]:overflow-x-auto
        max-[578px]:min-h-[150px] max-[578px]:pb-1 max-[578px]:snap-x max-[578px]:snap-mandatory
      `;

  return (
    <section className={`flex flex-col flex-1 min-h-0 ${className}`}>
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 shrink-0">
          {title}
        </h2>
      )}
      <div className={gridClass}>
        {items.map((item, index) => (
          <CategoryItem
            key={item.id ?? item.subcategorySlug}
            title={item.title}
            image={item.image}
            categorySlug={item.categorySlug}
            subcategorySlug={item.subcategorySlug}
            priority={index < 4}
            imageFit={variant === 'home' ? 'cover' : 'contain'}
          />
        ))}
      </div>
    </section>
  );
}
