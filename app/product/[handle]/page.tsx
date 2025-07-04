import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import GalleryImages from '@/components/GalleryImages';
import Link from 'next/link';
import { catalogCategory } from '@/data/catalogCategory';
// import VariantSelector from '@/components/VariantSelector';
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
      <div className="text-sm mb-4 text-gray-500">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Блок с заголовком — первым на мобилках */}
          <div className="order-1 md:order-none md:col-span-2">
            <h1 className="text-3xl font-bold mb-4 text-center">
              {product.title}
            </h1>
          </div>

          {/* Галерея — второй блок на мобилках, первый на десктопе */}
          <div className="order-2 md:order-1 border">
            <GalleryImages images={product.images} title={product.title} />
          </div>

          {/* Описание и цена — третий блок на мобилках, второй на десктопе */}
          <div className="order-3 md:order-2 border border-red-500">
            <div className="text-gray-600 mb-4 leading-relaxed space-y-2">
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

            <div className="text-2xl font-semibold mb-6">
              <h3>
                Ціна: <span className="text-green-600">{product.price} ₴</span>
              </h3>
              {product.oldPrice && (
                <span className="text-gray-400 line-through text-sm">
                  Стара ціна {product.oldPrice} ₴
                </span>
              )}
            </div>
            {/* variant  */}
            {/* <VariantSelector
              variants={product.variants}
              onSelect={(variant) => {
                // можно сохранить в cookies, localStorage, context или прокинуть в addToCart
                console.log('Вибрано варіант:', variant);
              }}
            /> */}
            {/* variant  */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition cursor-pointer min-w-[182px]">
                Додати в корзину
              </button>
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition cursor-pointer min-w-[182px]">
                Додати в обране
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
