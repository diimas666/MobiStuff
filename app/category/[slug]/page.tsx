import { popularItems } from '@/data/categoryData';
import Link from 'next/link';
interface Params {
  slug: string;
}
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
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
  return (
    <section className="p-6">
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
      {/* Здесь позже можно отрендерить товары категории */}
      <p>Тут будуть товари категорії: {category.title}</p>
    </section>
  );
}
