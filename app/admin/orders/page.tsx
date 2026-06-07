'use client';

import { useEffect, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import ProductImage from '@/components/ProductImage';

interface OrderItem {
  _id?: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
  handle?: string;
}

interface Order {
  _id: string;
  name: string;
  lastName?: string;
  phone: string;
  email?: string;
  comment?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  total: number;
  items?: OrderItem[];
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/admin/getOrders')
      .then((res) => res.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!confirm('Видалити вибрані замовлення?')) return;

    await fetch('/api/admin/deleteOrders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected }),
    });

    setSelected([]);
    fetchOrders();
  };

  return (
    <AdminWrapper>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-4">📦 Замовлення</h1>

        {selected.length > 0 && (
          <button
            onClick={deleteSelected}
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            🗑️ Видалити вибрані ({selected.length})
          </button>
        )}

        {loading ? (
          <p>Завантаження...</p>
        ) : orders.length === 0 ? (
          <p>Замовлень поки немає.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b text-left w-10">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? orders.map((o) => o._id) : []
                        )
                      }
                      checked={selected.length === orders.length && orders.length > 0}
                    />
                  </th>
                  <th className="p-3 border-b text-left whitespace-nowrap">Дата</th>
                  <th className="p-3 border-b text-left whitespace-nowrap">Клієнт</th>
                  <th className="p-3 border-b text-left min-w-[320px]">Товари</th>
                  <th className="p-3 border-b text-left whitespace-nowrap">Сума</th>
                  <th className="p-3 border-b text-left">Доставка</th>
                  <th className="p-3 border-b text-left whitespace-nowrap">Оплата</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 align-top">
                    <td className="p-3 border-b">
                      <input
                        type="checkbox"
                        checked={selected.includes(order._id)}
                        onChange={() => toggleSelect(order._id)}
                      />
                    </td>
                    <td className="p-3 border-b whitespace-nowrap text-gray-600">
                      {new Date(order.createdAt).toLocaleString('uk-UA')}
                    </td>
                    <td className="p-3 border-b">
                      <div className="font-medium">
                        {order.name} {order.lastName}
                      </div>
                      <div className="text-gray-600 mt-1">{order.phone}</div>
                      {order.email && (
                        <div className="text-gray-500 text-xs mt-0.5">{order.email}</div>
                      )}
                      {order.comment && (
                        <div className="text-gray-500 text-xs mt-1 italic">
                          {order.comment}
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-b">
                      {order.items?.length ? (
                        <ul className="space-y-2">
                          {order.items.map((item, index) => (
                            <li
                              key={`${order._id}-${item._id || item.handle || index}`}
                              className="flex items-start gap-3"
                            >
                              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <ProductImage
                                  src={item.image || '/no-image.png'}
                                  alt={item.title}
                                  fill
                                  sizes="56px"
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium leading-snug line-clamp-2">
                                  {item.title}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  {item.quantity} × {item.price} ₴ ={' '}
                                  <span className="font-semibold text-gray-900">
                                    {item.quantity * item.price} ₴
                                  </span>
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 border-b whitespace-nowrap font-bold text-green-700">
                      {order.total} ₴
                    </td>
                    <td className="p-3 border-b">
                      <div>{order.city || '—'}</div>
                      {order.warehouse && (
                        <div className="text-gray-600 text-xs mt-1 leading-relaxed">
                          {order.warehouse}
                        </div>
                      )}
                    </td>
                    <td className="p-3 border-b whitespace-nowrap">
                      {order.paymentMethod === 'card' ? 'Картка' : 'Післяплата'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminWrapper>
  );
}
