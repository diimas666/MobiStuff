import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchProducts } from '@/lib/api';

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise; // Асинхронно получаем params
  const { handle } = params;

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
  const params = await paramsPromise; // Асинхронно получаем params
  const { handle } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      '❌ NEXT_PUBLIC_BASE_URL не задан. Добавь его в .env.local'
    );
  }
  const res = await fetch(`${baseUrl}/api/products/${handle}`);
  console.log('👉 BASE_URL =', process.env.NEXT_PUBLIC_BASE_URL);

  if (!res.ok) return notFound();

  const product = await res.json();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Image
            src={product.image.replace(/"/g, '')} // ✅ удаляем лишние кавычки
            alt={product.title}
            width={600}
            height={600}
            priority
            className="w-full h-auto object-contain rounded-md shadow"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-4">Характеристики товару{product.description}</p>
          <div className="text-2xl font-semibold mb-6">Ціна:{product.price} ₴</div>
          <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
            Додати в корзину
          </button>
        </div>
      </div>
    </div>
  );
}
