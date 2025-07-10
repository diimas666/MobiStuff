// app/returns/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Повернення | MobiStuff',
  description:
    'Політика повернення товарів у магазині MobiStuff. Ви можете повернути товар протягом 14 днів згідно із законодавством України.',
  alternates: {
    canonical: '/returns',
  },
};

export default function ReturnsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-left">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Повернення товарів
      </h1>

      <p className="mb-6 text-gray-700 text-lg text-center">
        Ми дбаємо про комфорт і впевненість кожного клієнта. Якщо товар вам не
        підійшов — ви маєте право його повернути або обміняти.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">📦 Умови повернення</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-800">
          <li>
            Повернення або обмін можливий протягом <strong>14 днів</strong> з
            моменту отримання
          </li>
          <li>
            Товар повинен бути:
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>в оригінальній упаковці</li>
              <li>без слідів використання чи пошкоджень</li>
              <li>у повній комплектації</li>
            </ul>
          </li>
          <li>
            Повернення здійснюється службою <strong>Нова Пошта</strong> за
            попереднім погодженням
          </li>
          <li>
            Перед поверненням обов’язково{' '}
            <strong>зв’яжіться з нашою підтримкою</strong>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          📋 Як оформити повернення
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-800">
          <li>
            Напишіть нам на email:{' '}
            <a href="mailto:mobistuffinfo@gmail.com" className="underline">
              mobistuffinfo@gmail.com
            </a>
          </li>
          <li>
            У листі вкажіть: номер замовлення, причину повернення, фото товару
            (за потреби)
          </li>
          <li>Ми підтвердимо можливість повернення і надамо інструкцію</li>
          <li>Відправте товар через Нову Пошту за вказаними даними</li>
        </ol>
      </section>

      <p className="mt-10 text-center text-gray-600">
        Повернення коштів здійснюється протягом{' '}
        <strong>3–5 банківських днів</strong> після перевірки товару.
      </p>

      <p className="mt-4 text-center text-sm text-gray-500">
        Детальніше — в{' '}
        <a
          href="https://zakon.rada.gov.ua/laws/show/1023-12"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Законі України «Про захист прав споживачів»
        </a>
      </p>
    </main>
  );
}
