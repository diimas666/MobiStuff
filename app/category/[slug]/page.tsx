import { popularItems } from '@/data/categoryData';
import { actualProposition } from '@/data/actualProposition.generated';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Params }) {
  return {
    title: `${params.slug} – Категорія | MobiStuff`,
    description: `Оберіть найкращі ${params.slug} з нашого каталогу.`,
  };
}

export default function CategoryPage({ params }: { params: Params }) {
  const category = popularItems.find((item) => item.slug === params.slug);

  if (!category) {
    return <div className="p-6">Категорія не знайдена</div>;
  }

  const filteredProducts = actualProposition.filter(
    (product) => product.categorySlug === params.slug
  );

  return (
    <section>
      <div className="breadcrumbs">
        <nav className="text-sm mb-4 text-gray-500">
          <Link href="/" className="hover:underline">
            Головна
          </Link>{' '}
          &nbsp;/&nbsp;
          <span className="font-semibold text-gray-700">{category.title}</span>
        </nav>
      </div>

      <h1 className="text-3xl font-bold mb-4">{category.title}</h1>
      <p className="text-gray-600 mb-6">
        Оберіть з найкращих товарів у категорії "<span className="font-semibold">{category.title}</span>".
      </p>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Товари не знайдено.</p>
      )}
    </section>
  );
}
