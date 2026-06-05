'use client';

import AdminWrapper from '@/components/AdminWrapper';

export default function SyncAdminPage() {
  return (
    <AdminWrapper>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Синхронизация с MMA</h1>

        <div className="bg-gray-50 border rounded-xl p-5 space-y-3 text-sm">
          <p>
            Скрипт загружает товары с <strong>mma.ua</strong>, применяет наценку
            и обновляет каталог MobiStuff.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Обычные товары: <strong>+40%</strong> к оптовой цене</li>
            <li>Кабели и зарядки: <strong>+80%</strong></li>
            <li>Описания и категории — как на MMA</li>
            <li>
              Цены, изменённые вручную в админке,{' '}
              <strong>не перезаписываются</strong>
            </li>
          </ul>
        </div>

        <div className="bg-black text-white rounded-xl p-5 font-mono text-sm">
          <p className="text-gray-400 mb-2">Запуск раз в день (в терминале):</p>
          <code>npm run sync-mma</code>
        </div>

        <div className="border rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold">Настройка (.env.local)</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">{`MMA_LOGIN=ваш@email.com
MMA_PASSWORD=ваш_пароль
MONGODB_URI=...

# Опционально — тест на 10 товаров:
# MMA_SYNC_LIMIT=10

# Опционально — одна категория:
# MMA_CATEGORY_SLUG=category-navushniki`}</pre>
        </div>

        <p className="text-gray-500 text-xs">
          Рекомендуется запускать локально или через cron на сервере. Полная
          синхронизация ~8000 товаров занимает 30–60 минут.
        </p>
      </div>
    </AdminWrapper>
  );
}
