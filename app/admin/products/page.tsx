'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { adminHeaders } from '@/lib/adminHeaders';
import { toast } from 'react-toastify';
import { catalogCategory } from '@/data/catalogCategory';

export default function AllProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const subcategoryOptions = useMemo(() => {
    if (!categoryFilter) return [];
    const category = catalogCategory.find((c) => c.slug === categoryFilter);
    return category?.subcategories ?? [];
  }, [categoryFilter]);

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

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      if (subcategoryFilter) {
        if (
          p.categorySlug !== categoryFilter ||
          p.subcategorySlug !== subcategoryFilter
        ) {
          return false;
        }
      } else if (categoryFilter && p.categorySlug !== categoryFilter) {
        return false;
      }

      if (!query) return true;

      const categoryLabel = getCategoryLabel(
        p.categorySlug,
        p.subcategorySlug
      ).toLowerCase();

      return (
        p.title?.toLowerCase().includes(query) ||
        p.handle?.toLowerCase().includes(query) ||
        p.mmaKey?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.categorySlug?.toLowerCase().includes(query) ||
        p.subcategorySlug?.toLowerCase().includes(query) ||
        categoryLabel.includes(query)
      );
    });
  }, [products, categoryFilter, subcategoryFilter, searchQuery]);

  // тренд
  const toggleTrending = async (id: string, isTrending: boolean) => {
    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: adminHeaders(),
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

  const getStockStatus = (p: { inStock?: boolean; lowStock?: boolean }) => {
    if (p.inStock === false) return 'out' as const;
    if (p.lowStock) return 'low' as const;
    return 'in' as const;
  };

  const cycleStockStatus = async (product: {
    _id: string;
    inStock?: boolean;
    lowStock?: boolean;
  }) => {
    const current = getStockStatus(product);
    const next =
      current === 'in'
        ? { inStock: true, lowStock: true }
        : current === 'low'
          ? { inStock: false, lowStock: false }
          : { inStock: true, lowStock: false };

    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ id: product._id, ...next }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, ...next } : p))
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
        headers: adminHeaders(),
        body: JSON.stringify({ id, price }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...data.product } : p))
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

  const updateDiscount = async (id: string, discountPercent: number) => {
    if (discountPercent < 0 || discountPercent >= 100) {
      if (discountPercent !== 0) return;
    }

    try {
      const res = await fetch(`/api/admin/updateProduct`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ id, discountPercent }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...data.product } : p))
        );
        toast.success(
          discountPercent > 0
            ? `Знижку ${discountPercent}% застосовано`
            : 'Знижку скасовано'
        );
      } else {
        toast.error('Не вдалося оновити знижку');
      }
    } catch (err) {
      console.error(err);
      toast.error('Помилка оновлення знижки');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Ти впевнений?')) return;

    try {
      const res = await fetch(`/api/admin/deleteProduct`, {
        method: 'DELETE',
        headers: adminHeaders(),
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

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук за назвою, артикулом, брендом..."
            className="border rounded px-3 py-1.5 text-sm bg-white min-w-[220px] flex-1 max-w-md"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Скинути
            </button>
          )}

          {!loading && (
            <span className="text-sm text-gray-500">
              Показано {filteredProducts.length} з {products.length}
            </span>
          )}
        </div>

        {loading ? (
          <p>Завантаження...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-500">
            {searchQuery
              ? 'За вашим запитом нічого не знайдено.'
              : 'Товарів у цій категорії немає.'}
          </p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border w-16">Фото</th>
                <th className="p-2 border">Назва</th>
                <th className="p-2 border">Категорія</th>
                <th className="p-2 border">Ціна</th>
                <th className="p-2 border">Знижка %</th>
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
                      key={`price-${p._id}-${p.price}`}
                      defaultValue={p.price}
                      className="w-20 border rounded px-1 py-0.5"
                      onBlur={(e) =>
                        updatePrice(p._id, parseFloat(e.target.value))
                      }
                    />
                    {p.oldPrice && p.oldPrice > p.price && (
                      <span className="block text-xs text-gray-400 line-through">
                        {p.oldPrice} грн
                      </span>
                    )}
                    {p.priceManuallyEdited && (
                      <span className="block text-xs text-blue-600">ручна</span>
                    )}
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        key={`discount-${p._id}-${p.discountPercent ?? 0}`}
                        defaultValue={p.discountPercent ?? ''}
                        placeholder="0"
                        className="w-14 border rounded px-1 py-0.5"
                        onBlur={(e) =>
                          updateDiscount(
                            p._id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </td>
                  <td className="border p-2">
                    {(() => {
                      const status = getStockStatus(p);
                      return (
                        <button
                          onClick={() => cycleStockStatus(p)}
                          className={`px-2 py-1 text-white rounded text-xs whitespace-nowrap ${
                            status === 'in'
                              ? 'bg-green-500'
                              : status === 'low'
                                ? 'bg-amber-500'
                                : 'bg-gray-400'
                          }`}
                          title="Клік: В наявності → Закінчується → Немає"
                        >
                          {status === 'in'
                            ? 'В наявності'
                            : status === 'low'
                              ? 'Закінчується'
                              : 'Немає'}
                        </button>
                      );
                    })()}
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
