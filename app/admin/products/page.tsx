'use client';

import { useEffect, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { toast } from 'react-toastify';

export default function AllProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        <h2 className="text-xl font-bold mb-4">Всі товари</h2>
        {loading ? (
          <p>Завантаження...</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Назва</th>
                <th className="p-2 border">Категорія</th>
                <th className="p-2 border">Ціна</th>
                <th className="p-2 border">Наявність</th>
                <th className="p-2 border">Тренд</th>
                <th className="p-2 border">Дія</th>
                
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="text-sm">
                  <td className="border p-2">{p.title}</td>
                  <td className="border p-2">
                    {p.categorySlug} / {p.subcategorySlug}
                  </td>
                  <td className="border p-2">{p.price} грн</td>
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
