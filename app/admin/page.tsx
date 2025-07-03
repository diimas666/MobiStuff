'use client';
import { useState } from 'react';
import { catalogCategory } from '@/data/catalogCategory';
import { toSlug } from '@/lib/slugify';

export default function AdminPage() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    images: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    tags: '',
    isNew: false,
    isFeatured: false,
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/admin/addProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
      },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        images: form.images.split(',').map((i) => i.trim()),
        categorySlug: toSlug(form.category),
        subcategorySlug: toSlug(form.subcategory),
        handle: toSlug(form.title),
        tags: form.tags.split(',').map((t) => t.trim()),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Товар додано!');
      setForm({
        title: '',
        description: '',
        image: '',
        images: '',
        price: '',
        category: '',
        subcategory: '',
        brand: '',
        tags: '',
        isNew: false,
        isFeatured: false,
      });
    } else {
      alert(`Помилка: ${data.error}`);
    }

    alert(res.ok ? 'Товар додано!' : `Помилка: ${data.error}`);
  };

  const subcategories =
    catalogCategory.find((cat) => cat.title === form.category)?.subcategories ||
    [];

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 space-y-4">
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
          checked={form.isFeatured}
          onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
        />
        {' Показувати на головній'}
      </label>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded">
        Загрузити товар
      </button>
    </form>
  );
}
