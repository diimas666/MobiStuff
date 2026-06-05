'use client';

import AdminWrapper from '@/components/AdminWrapper';

const MARKUP_RULES = [
  {
    percent: 40,
    label: 'Стандарт',
    categories: 'Усі інші товари',
    example: 'чохли, навушники, павербанки, годинники…',
  },
  {
    percent: 80,
    label: 'Кабелі та зарядки',
    categories: 'category-zaryadki-i-kabeli',
    example: 'Lightning, Type-C, USB, бездротові зарядки, мульті…',
  },
  {
    percent: 80,
    label: 'Захисне скло',
    categories: 'category-zashtitnie-stekla',
    example: 'скло для iPhone, Samsung, універсальне…',
  },
  {
    percent: 50,
    label: 'Мишки',
    categories: 'category-mishi',
    example: 'компʼютерні миші, бездротові, ігрові…',
  },
];

export default function SyncAdminPage() {
  return (
    <AdminWrapper>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Синхронізація з MMA</h1>

        <div className="bg-gray-50 border rounded-xl p-5 space-y-3 text-sm">
          <p>
            Скрипт <strong>npm run sync-mma</strong> завантажує товари з{' '}
            <strong>mma.ua</strong> (~4700 позицій), застосовує наценку до
            оптової ціни та оновлює каталог MobiStuff у MongoDB.
          </p>
          <p className="text-gray-600">
            Сайт на Vercel одразу показує оновлені дані з бази — пушити код
            після кожної синхронізації не потрібно.
          </p>
        </div>

        <div className="border rounded-xl p-5 space-y-4 text-sm">
          <h2 className="font-semibold text-base">Наценка до оптової ціни</h2>
          <p className="text-gray-600">
            Оптова ціна MMA приходить у <strong>USD</strong>. Скрипт
            конвертує в гривні (курс <code>MMA_USD_RATE</code>, за замовчуванням{' '}
            <strong>42</strong>) і додає наценку залежно від категорії:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border text-left text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Наценка</th>
                  <th className="border p-2">Категорія</th>
                  <th className="border p-2">Slug / приклади</th>
                </tr>
              </thead>
              <tbody>
                {MARKUP_RULES.map((rule) => (
                  <tr key={rule.label}>
                    <td className="border p-2 font-bold text-green-700 whitespace-nowrap">
                      +{rule.percent}%
                    </td>
                    <td className="border p-2 font-medium">{rule.label}</td>
                    <td className="border p-2 text-gray-600">
                      <span className="block font-mono text-xs text-gray-800 mb-0.5">
                        {rule.categories}
                      </span>
                      {rule.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-xs">
            Приклад: опт $10 → 420 грн → з наценкою +40% = <strong>588 грн</strong>
            ; скло +80% = <strong>756 грн</strong>; мишка +50% ={' '}
            <strong>630 грн</strong>.
          </p>
        </div>

        <div className="border rounded-xl p-5 space-y-3 text-sm">
          <h2 className="font-semibold text-base">Що оновлюється</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Назви, описи (HTML з MMA), бренди</li>
            <li>Ціни з наценкою (якщо не змінені вручну)</li>
            <li>Наявність (inStock)</li>
            <li>Фото — URL з <code>cdn.mma.ua</code></li>
            <li>Категорії та підкатегорії — slug як на MMA</li>
            <li>Нові товари з MMA додаються автоматично</li>
            <li>
              Товари, яких немає в MMA, знімаються з наявності (лише при{' '}
              <strong>повній</strong> синхронізації)
            </li>
          </ul>
        </div>

        <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold text-base text-blue-900">
            Захист ручних цін
          </h2>
          <p className="text-blue-800">
            Якщо ви змінили ціну в{' '}
            <a href="/admin/products" className="underline font-medium">
              адмінці → Товари
            </a>
            , синхронізація <strong>не перезапише</strong> її. Біля ціни
            зʼявиться позначка «ручна».
          </p>
        </div>

        <div className="bg-black text-white rounded-xl p-5 font-mono text-sm space-y-3">
          <div>
            <p className="text-gray-400 mb-2">Повна синхронізація (~30–60 хв):</p>
            <code>npm run sync-mma</code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Тест на 10 товарів:</p>
            <code>MMA_SYNC_LIMIT=10 npm run sync-mma</code>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Одна категорія:</p>
            <code>MMA_CATEGORY_SLUG=category-mishi npm run sync-mma</code>
          </div>
        </div>

        <div className="border rounded-xl p-5 space-y-2 text-sm">
          <h2 className="font-semibold">Налаштування (.env.local)</h2>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-xs">{`MMA_LOGIN=ваш@email.com
MMA_PASSWORD=ваш_пароль
MONGODB_URI=...

# Курс долара (опціонально):
MMA_USD_RATE=42

# Тест на N товарів:
# MMA_SYNC_LIMIT=10

# Тільки одна категорія:
# MMA_CATEGORY_SLUG=category-mishi`}</pre>
        </div>

        <div className="border rounded-xl p-5 space-y-2 text-sm text-gray-700">
          <h2 className="font-semibold text-base">Як часто запускати</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Раз на день</strong> — якщо важливі актуальні ціни та
              наявність
            </li>
            <li>
              <strong>Раз на 3 дні</strong> — достатньо для стабільного
              асортименту
            </li>
          </ul>
          <p className="text-gray-500 text-xs pt-1">
            Запускайте локально в терміналі. Кнопки синхронізації в адмінці
            немає — тільки ця інструкція.
          </p>
        </div>
      </div>
    </AdminWrapper>
  );
}
