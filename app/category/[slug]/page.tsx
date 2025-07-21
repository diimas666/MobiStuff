import { catalogCategory } from '@/data/catalogCategory';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';

export async function generateStaticParams() {
  return catalogCategory.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const category = catalogCategory.find((cat) => cat.slug === params.slug);
  if (!category) return {};

  return {
    title: category.seoTitle,
    description: category.seoDescription,
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = catalogCategory.find((cat) => cat.slug === params.slug);

  if (!category) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{category.title}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {category.subcategories.map((sub) => (
          <Link
            key={sub.slug}
            href={`/category/${category.slug}/${sub.slug}`}
            className="border rounded-lg p-4 hover:shadow-md bg-white transition"
          >
            <div className="text-md font-semibold mb-1">{sub.title}</div>
            <div className="text-sm text-gray-500">Переглянути товари →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
