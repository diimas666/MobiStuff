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

export default function CategoryGrid({ title, items, className = '' }: CategoryGridProps) {
  return (
    <section className={className}>
      {title && <h2 className="mb-5 text-xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item, index) => (
          <CategoryItem
            key={item.id ?? item.subcategorySlug}
            title={item.title}
            image={item.image}
            categorySlug={item.categorySlug}
            subcategorySlug={item.subcategorySlug}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  );
}
