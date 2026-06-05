'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { toast } from 'react-toastify';
import { catalogCategory } from '@/data/catalogCategory';

export default function AllProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');

  const subcategoryOptions = useMemo(() => {
    if (!categoryFilter) return [];
    const category = catalogCategory.find((c) => c.slug === categoryFilter);
    return category?.subcategories ?? [];
  }, [categoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (subcategoryFilter) {
        return (
          p.categorySlug === categoryFilter &&
          p.subcategorySlug === subcategoryFilter
        );
      }
      if (categoryFilter) {
        return p.categorySlug === categoryFilter;
      }
      return true;
    });
  }, [products, categoryFilter, subcategoryFilter]);

  const getCategoryLabel = (categorySlug?: string, subcategorySlug?: string) => {
    const category = catalogCategory.find((c) => c.slug === categorySlug);
    const sub = category?.subcategories.find((s) => s.slug === subcategorySlug);
    if (category && sub) return `${category.title} / ${sub.title}`;
    if (category) return category.title;
    if (categorySlug || subcategorySlug) {
      return `${categorySlug ?? '—'} / ${subcategorySlug ?? '—'}`;
    }
    return '—';
  };
  // тренд
  const toggleTrending = async (id: string, isTrending: boolean) => {
    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
        },
        body: JSON.stringify({ id, isTrending: !isTrending }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, isTrending: !isTrending } : p
          )
        );
        toast.success('Статус "Тренд" оновлено');
      } else {
        toast.error('Не вдалося оновити "Тренд"');
      }
    } catch (err) {
      console.error(err);
      toast.error('Помилка оновлення "Тренд"');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);

        toast.error('Помилка при завантаженні товарів');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleInStock = async (id: string, inStock: boolean) => {
    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
        },
        body: JSON.stringify({ id, inStock: !inStock }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, inStock: !inStock } : p))
        );
        toast.success('Наявність оновлено');
      } else {
        toast.error('Не вдалося оновити');
      }
    } catch (err) {
      console.error(err);

      toast.error('Помилка оновлення');
    }
  };

  const updatePrice = async (id: string, price: number) => {
    if (!price || price <= 0) return;

    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
        },
        body: JSON.stringify({ id, price }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, price, priceManuallyEdited: true } : p
          )
        );
        toast.success('Ціну оновлено (захищено від синхронізації)');
      } else {
        toast.error('Не вдалося оновити ціну');
      }
    } catch (err) {
      console.error(err);
      toast.error('Помилка оновлення ціни');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Ти впевнений?')) return;

    try {
      const res = await fetch(`/api/admin/deleteProduct`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success('Товар видалено');
      } else {
        toast.error('Не вдалося видалити');
      }
    } catch (err) {
      console.error(err);
      toast.error('Помилка видалення');
    }
  };

  return (
    <AdminWrapper>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h2 className="text-xl font-bold">Всі товари</h2>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter('');
            }}
            className="border rounded px-3 py-1.5 text-sm bg-white min-w-[180px]"
          >
            <option value="">Усі категорії</option>
            {catalogCategory.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.title}
              </option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            disabled={!categoryFilter}
            className="border rounded px-3 py-1.5 text-sm bg-white min-w-[200px] disabled:opacity-50"
          >
            <option value="">Усі підкатегорії</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.title}
              </option>
            ))}
          </select>

          {!loading && (
            <span className="text-sm text-gray-500">
              Показано {filteredProducts.length} з {products.length}
            </span>
          )}
        </div>

        {loading ? (
          <p>Завантаження...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">Товарів у цій категорії немає.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border w-16">Фото</th>
                <th className="p-2 border">Назва</th>
                <th className="p-2 border">Категорія</th>
                <th className="p-2 border">Ціна</th>
                <th className="p-2 border">Наявність</th>
                <th className="p-2 border">Тренд</th>
                <th className="p-2 border">Дія</th>
                
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p._id} className="text-sm">
                  <td className="border p-2 w-16">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-12 h-12 object-contain rounded bg-gray-50"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="border p-2">{p.title}</td>
                  <td className="border p-2">
                    {getCategoryLabel(p.categorySlug, p.subcategorySlug)}
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      defaultValue={p.price}
                      className="w-20 border rounded px-1 py-0.5"
                      onBlur={(e) =>
                        updatePrice(p._id, parseFloat(e.target.value))
                      }
                    />
                    {p.priceManuallyEdited && (
                      <span className="block text-xs text-blue-600">ручна</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => toggleInStock(p._id, p.inStock)}
                      className={`px-2 py-1 text-white rounded ${
                        p.inStock ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      {p.inStock ? 'В наявності' : 'Немає'}
                    </button>
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => toggleTrending(p._id, p.isTrending)}
                      className={`px-2 py-1 text-white rounded ${
                        p.isTrending ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                    >
                      {p.isTrending ? '✅ Так' : '–'}
                    </button>
                  </td>

                  <td className="border p-2">
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminWrapper>
  );
}
