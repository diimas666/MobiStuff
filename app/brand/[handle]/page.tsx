import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByBrand } from '@/lib/mongo/products';
import { brands } from '@/data/brands';
import ProductCardClient from '@/components/ProductCardClient';
import CategoryList from '@/components/CategoryList';
import Image from 'next/image';

export function generateStaticParams() {
  return brands.map((brand) => ({
    handle: brand.handle,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params; // Дожидаемся params
  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );

  if (!brand) return { title: 'Бренд не найден' };

  return {
    title: `${brand.title} – Товары бренда`,
    description: brand.description?.[0] || `Купить товары ${brand.title}`,
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { handle } = await params; // Дожидаемся params
  const resolvedSearchParams = await searchParams; // Дожидаемся searchParams
  const page = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const perPage = 20;

  const brand = brands.find(
    (b) => b.handle.toLowerCase() === handle.toLowerCase()
  );

  if (!brand) return notFound();

  const { products, total } = await getProductsByBrand(
    brand.title,
    page,
    perPage
  );

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      {brand.imageFull && (
        <div className="relative w-full min-h-[90px] max-h-[400px] overflow-hidden block mb-4">
          <Image
            src={brand.imageFull}
            alt={brand.title}
            width={1200}
            height={300}
            className="object-cover w-full"
          />
        </div>
      )}

      <div className="flex gap-4">
        <aside className="w-[250px] hidden md:block">
          <h3 className="text-2xl font-semibold mb-2">Каталог</h3>
          <CategoryList />
        </aside>

        <section className="flex-1">
          <h1 className="font-semibold text-2xl mb-2">{brand.title}</h1>

          {Array.isArray(brand.description) &&
            brand.description.map((p, i) => (
              <p key={i} className="mb-1 text-gray-700">
                {p}
              </p>
            ))}

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-1 mt-5">
            {products.map((product) => (
              <ProductCardClient key={product._id} product={product} />
            ))}

            {products.length === 0 && (
              <p className="col-span-full text-center text-gray-500">
                Товари цього бренду не знайдено.
              </p>
            )}
          </div>

          {/* пагинация */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
              {page > 1 && (
                <a
                  href={`/brand/${handle}?page=${page - 1}`}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  ← Попередня
                </a>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                )
                .map((p, i, arr) => {
                  const prev = arr[i - 1];
                  const showDots = prev && p - prev > 1;

                  return [
                    showDots && (
                      <span key={`dots-${p}`} className="px-2">
                        ...
                      </span>
                    ),
                    <a
                      key={`page-${p}`}
                      href={`/brand/${handle}?page=${p}`}
                      className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                        page === p ? 'bg-black text-white' : 'text-black'
                      }`}
                    >
                      {p}
                    </a>,
                  ];
                })}

              {page < totalPages && (
                <a
                  href={`/brand/${handle}?page=${page + 1}`}
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  Наступна →
                </a>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
