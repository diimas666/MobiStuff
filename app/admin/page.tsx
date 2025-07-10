'use client';
import { useState } from 'react';
import { catalogCategory } from '@/data/catalogCategory';
import { toSlug } from '@/lib/slugify';
import { toast } from 'react-toastify';
import AdminWrapper from '@/components/AdminWrapper';
import Link from 'next/link';
import Image from 'next/image';
const initialFormState = {
  title: '',
  description: '',
  image: '',
  images: '',
  price: '',
  oldPrice: '',
  discountPercent: '',
  category: '',
  subcategory: '',
  brand: '',
  tags: '',
  isNew: false,
  isFeatured: false,
  inStock: true,
  rating: '0',
  reviewsCount: '0',
  variants: '',
  isTrending: false,
};
export default function AdminPage() {
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    //     console.log('🧾 Відправляється товар:', {
    //   ...form,
    //   isTrending: form.isTrending,
    // });
    const res = await fetch('/api/admin/addProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
      },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
        discountPercent: form.discountPercent
          ? parseFloat(form.discountPercent)
          : undefined,
        inStock: form.inStock,
        rating: parseFloat(form.rating),
        reviewsCount: parseInt(form.reviewsCount),
        variants: form.variants
          ? form.variants.split(',').map((v) => v.trim())
          : [],
        images: form.images.split(',').map((i) => i.trim()),
        categorySlug: toSlug(form.category),
        subcategorySlug: toSlug(form.subcategory),
        handle: toSlug(form.title),
        isTrending: form.isTrending,

        tags: form.tags.split(',').map((t) => t.trim()),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success('Товар успішно додано!');
      setForm(initialFormState);
    } else {
      toast.error(`❌ Помилка: ${data.error}`);
    }
  };

  const subcategories =
    catalogCategory.find((cat) => cat.title === form.category)?.subcategories ||
    [];

  return (
    <AdminWrapper>
      <Link href="/admin/products">
        <button className="bg-gray-200 text-black px-4 py-2 rounded ml-2 cursor-pointer">
          Всі товари
        </button>
      </Link>
      <Link href="/admin/import">
        <button className="bg-gray-200 text-black px-4 py-2 rounded ml-2 cursor-pointer">
          Import товарів
        </button>
      </Link>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-4">
        {/* Превью картинки */}
        {form.image && !form.image.startsWith('http') && (
          <p className="text-red-500 text-sm">⚠️ Неправильний формат URL</p>
        )}
        {form.image && (
          <div className="w-full border p-2 rounded bg-white shadow">
            <Image
              src={form.image}
              alt="Головне зображення"
              width={200}
              height={200}
              className="object-contain mx-auto"
            />
          </div>
        )}
        <input
          placeholder="Назва"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border p-2"
          required
        />
        <textarea
          placeholder="Опис"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border p-2"
        />
        <input
          placeholder="Ціна"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border p-2"
          required
        />
        <input
          placeholder="Стара ціна (необов’язково)"
          type="number"
          value={form.oldPrice}
          onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
          className="w-full border p-2"
        />

        <input
          placeholder="Знижка % (необов’язково)"
          type="number"
          value={form.discountPercent}
          onChange={(e) =>
            setForm({ ...form, discountPercent: e.target.value })
          }
          className="w-full border p-2"
        />
        <input
          placeholder="Головне фото (URL)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full border p-2"
          required
        />
        <input
          placeholder="Галерея фото (через кому)"
          value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="w-full border p-2"
        />

        {/* Категория и подкатегория */}
        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value, subcategory: '' })
          }
          className="w-full border p-2"
        >
          <option value="">Оберіть категорію</option>
          {catalogCategory.map((cat) => (
            <option key={cat.title} value={cat.title}>
              {cat.title}
            </option>
          ))}
        </select>

        {subcategories.length > 0 && (
          <select
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
            className="w-full border p-2"
          >
            <option value="">Оберіть підкатегорію</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        )}

        <input
          placeholder="Бренд"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="w-full border p-2"
        />

        <input
          placeholder="Теги (через кому)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border p-2"
        />

        <label className="block text-sm font-medium text-gray-700">
          Рейтинг (0–5)
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="w-full border p-2"
        />

        <label className="block text-sm font-medium text-gray-700">
          Кількість відгуків
        </label>
        <input
          type="number"
          value={form.reviewsCount}
          onChange={(e) => setForm({ ...form, reviewsCount: e.target.value })}
          className="w-full border p-2"
        />

        <input
          placeholder="Варіанти (через кому — колір, розмір тощо)"
          value={form.variants}
          onChange={(e) => setForm({ ...form, variants: e.target.value })}
          className="w-full border p-2"
        />

        <label className="block">
          <input
            type="checkbox"
            checked={form.inStock}
            onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
          />
          {' В наявності'}
        </label>

        <label className="block">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
          />
          {' Новинка'}
        </label>
        <label className="block">
          <input
            type="checkbox"
            checked={form.isTrending}
            onChange={(e) => setForm({ ...form, isTrending: e.target.checked })}
          />
          {' Тренд'}
        </label>

        <label className="block">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          {' Показувати на головній'}
        </label>

        <button
          disabled={loading}
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? 'Завантаження..' : 'Загрузити товар'}
        </button>
      </form>
    </AdminWrapper>
  );
}
