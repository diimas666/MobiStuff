import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryImages from '@/components/GalleryImages';
import Link from 'next/link';
import { catalogCategory } from '@/data/catalogCategory';
import VariantSection from '@/components/VariantSection';
export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await paramsPromise;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${handle}`
  );
  const product = await res.json();

  return {
    title: product.title || 'Товар',
    description: product.description || '',
  };
}

export default async function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await paramsPromise;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('❌ NEXT_PUBLIC_BASE_URL не задан');
  }

  const res = await fetch(`${baseUrl}/api/products/${handle}`);
  if (!res.ok) return notFound();

  const product = await res.json();
  const category = catalogCategory.find(
    (cat) => cat.slug === product.categorySlug
  );
  const subcategory = category?.subcategories.find(
    (sub) => sub.slug === product.subcategorySlug
  );
  return (
    <>
      {/* хлеб крошки  */}
      <div className="text-sm mb-4 text-gray-500 mb-4">
        <Link href="/" className="hover:underline">
          Головна
        </Link>{' '}
        /{' '}
        {category && (
          <>
            <Link
              href={`/category/${category.slug}/${subcategory?.slug}`}
              className="hover:underline"
            >
              {category.title}
            </Link>{' '}
            /{' '}
          </>
        )}
        <span className="font-semibold text-gray-700">{product.title}</span>
      </div>
      {/* хлеб крошки   конец */}
      <div className="max-w-5xl mx-auto p-6 border border-green-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
          {/* Левая колонка: изображения */}
          <div>
            <GalleryImages images={product.images} title={product.title} />
          </div>

          {/* Правая колонка: текст, кнопки */}
          <div className="flex flex-col gap-4">
            {/* Заголовок */}
            <h1 className="text-3xl sm:text-lg font-bold ">{product.title}</h1>

            {/* Цена */}
            <div className="text-2xl font-semibold">
              Ціна: <span className="text-green-600">{product.price} ₴</span>
              {product.oldPrice && (
                <div className="text-gray-400 line-through text-sm">
                  Стара ціна {product.oldPrice} ₴
                </div>
              )}
            </div>

            {/* Варианты */}
            {product.variants?.length > 0 && (
              <VariantSection variants={product.variants} />
            )}

            {/* Описание */}
            <div className="text-gray-600 leading-relaxed space-y-2 max-h-[300px] overflow-y-auto  rounded p-2">
              {product.description
                .split('\n')
                .map((line: string, index: number) => {
                  const isBullet = line.trim().startsWith('•');
                  return (
                    <p key={index} className={isBullet ? 'pl-5 relative' : ''}>
                      {isBullet ? (
                        <>
                          <span className="absolute left-0">•</span>{' '}
                          {line.replace(/^•\s?/, '')}
                        </>
                      ) : (
                        line
                      )}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>
        {/* конец  */}
      </div>
      <section className="border px-5">SLIDER</section>
    </>
  );
}
