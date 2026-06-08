'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminWrapper from '@/components/AdminWrapper';
import { adminHeaders } from '@/lib/adminHeaders';
import { MONTH_LABELS_UK } from '@/lib/adminAnalytics';

interface MonthBucket {
  month: number;
  label: string;
  revenue: number;
  cost: number;
  margin: number;
  ordersCount: number;
  pageViews: number;
  conversionRate: number;
  marginPercent: number;
}

interface AnalyticsLineItem {
  orderId: string;
  orderDate: string;
  customer: string;
  title: string;
  quantity: number;
  costPrice: number;
  salePrice: number;
  revenue: number;
  margin: number;
  marginPercent: number;
  costEstimated: boolean;
}

interface AnalyticsOrder {
  _id: string;
  name: string;
  lastName?: string;
  phone: string;
  total: number;
  paymentMethod?: string;
  city?: string;
  warehouse?: string;
  createdAt: string;
}

interface AnalyticsData {
  year: number;
  month: number;
  currentMonth: number | null;
  months: MonthBucket[];
  summary: {
    revenue: number;
    cost: number;
    margin: number;
    marginPercent: number;
    conversionRate: number;
    ordersCount: number;
    pageViews: number;
  };
  orders: AnalyticsOrder[];
  lineItems: AnalyticsLineItem[];
  totals: {
    totalCost: number;
    totalRevenue: number;
    totalMargin: number;
    marginPercent: number;
  };
}

export default function AdminAnalyticsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?year=${year}&month=${month}`, {
      headers: adminHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [year, month]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const maxRevenue = Math.max(...(data?.months.map((m) => m.revenue) || [1]), 1);

  return (
    <AdminWrapper>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">📊 Аналітика продажів</h1>
            <p className="text-sm text-gray-500 mt-1">
              Продажі, маржа та конверсія по місяцях
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Завантаження...</p>
        ) : !data ? (
          <p className="text-red-500">Не вдалося завантажити аналітику</p>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Продажі за {year} рік
              </h2>
              <div className="flex items-end justify-between gap-2 h-52 sm:h-64">
                {data.months.map((bucket) => {
                  const isSelected = bucket.month === month;
                  const isCurrent =
                    data.currentMonth === bucket.month && data.year === year;
                  const height = Math.max(
                    8,
                    Math.round((bucket.revenue / maxRevenue) * 100)
                  );

                  return (
                    <button
                      key={bucket.month}
                      type="button"
                      onClick={() => setMonth(bucket.month)}
                      className="flex-1 flex flex-col items-center gap-2 group min-w-0"
                    >
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        {bucket.revenue > 0 ? `${bucket.revenue} ₴` : '—'}
                      </span>
                      <div className="w-full flex items-end justify-center h-40 sm:h-48">
                        <div
                          className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                            isSelected
                              ? 'bg-green-600 ring-2 ring-green-400 ring-offset-2'
                              : isCurrent
                                ? 'bg-green-400'
                                : 'bg-green-200 group-hover:bg-green-300'
                          }`}
                          style={{ height: `${height}%` }}
                          title={`${bucket.label}: ${bucket.revenue} ₴`}
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isSelected ? 'text-green-700' : 'text-gray-600'
                        }`}
                      >
                        {bucket.label}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {bucket.ordersCount} зам.
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                label="Продажі"
                value={`${data.summary.revenue} ₴`}
                sub={`${data.summary.ordersCount} замовлень`}
              />
              <StatCard
                label="Конверсія"
                value={`${data.summary.conversionRate}%`}
                sub={`${data.summary.pageViews} переглядів`}
              />
              <StatCard
                label="Маржа"
                value={`${data.summary.margin} ₴`}
                sub={`${data.summary.marginPercent}% від продажів`}
              />
              <StatCard
                label="Закупка"
                value={`${data.summary.cost} ₴`}
                sub={MONTH_LABELS_UK[month - 1] + ` ${year}`}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Замовлення за {MONTH_LABELS_UK[month - 1]} {year}
              </h2>
              {data.orders.length === 0 ? (
                <p className="text-gray-500 text-sm">Замовлень у цьому місяці немає</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="p-2 border-b">Дата</th>
                        <th className="p-2 border-b">Клієнт</th>
                        <th className="p-2 border-b">Телефон</th>
                        <th className="p-2 border-b">Місто</th>
                        <th className="p-2 border-b">Оплата</th>
                        <th className="p-2 border-b text-right">Сума</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="p-2 border-b whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleString('uk-UA')}
                          </td>
                          <td className="p-2 border-b">
                            {order.name} {order.lastName}
                          </td>
                          <td className="p-2 border-b">{order.phone}</td>
                          <td className="p-2 border-b">{order.city || '—'}</td>
                          <td className="p-2 border-b">
                            {order.paymentMethod === 'card'
                              ? 'Картка'
                              : 'Післяплата'}
                          </td>
                          <td className="p-2 border-b text-right font-semibold text-green-700">
                            {order.total} ₴
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-1">
                Маржа по товарах — {MONTH_LABELS_UK[month - 1]} {year}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Закупка з MMA (опт USD × курс). Якщо немає — оцінка −40% від ціни
                продажу
              </p>
              {data.lineItems.length === 0 ? (
                <p className="text-gray-500 text-sm">Немає проданих товарів</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="p-2 border-b">Товар</th>
                        <th className="p-2 border-b">К-сть</th>
                        <th className="p-2 border-b text-right">Закупка</th>
                        <th className="p-2 border-b text-right">Продаж</th>
                        <th className="p-2 border-b text-right">Маржа</th>
                        <th className="p-2 border-b text-right">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.lineItems.map((item, index) => (
                        <tr
                          key={`${item.orderId}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="p-2 border-b">
                            <p className="font-medium line-clamp-2">{item.title}</p>
                            <p className="text-xs text-gray-400">
                              {item.customer} ·{' '}
                              {new Date(item.orderDate).toLocaleDateString('uk-UA')}
                            </p>
                          </td>
                          <td className="p-2 border-b">{item.quantity}</td>
                          <td className="p-2 border-b text-right">
                            {item.costPrice} ₴
                            {item.costEstimated && (
                              <span className="text-[10px] text-amber-600 block">
                                оцінка
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-b text-right">
                            {item.salePrice} ₴
                          </td>
                          <td
                            className={`p-2 border-b text-right font-semibold ${
                              item.margin >= 0 ? 'text-green-700' : 'text-red-600'
                            }`}
                          >
                            {item.margin} ₴
                          </td>
                          <td className="p-2 border-b text-right">
                            {item.marginPercent}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-900 text-white font-semibold">
                        <td className="p-3" colSpan={2}>
                          Разом за місяць
                        </td>
                        <td className="p-3 text-right">
                          {data.totals.totalCost} ₴
                        </td>
                        <td className="p-3 text-right">
                          {data.totals.totalRevenue} ₴
                        </td>
                        <td className="p-3 text-right text-green-300">
                          {data.totals.totalMargin} ₴
                        </td>
                        <td className="p-3 text-right">
                          {data.totals.marginPercent}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminWrapper>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
