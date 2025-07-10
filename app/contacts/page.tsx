// app/contacts/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Контакти | MobiStuff',
  description:
    'Зв’яжіться з нами — MobiStuff. Ми завжди на зв’язку для консультацій, замовлень та підтримки. Працюємо онлайн по всій Україні!',
  alternates: {
    canonical: '/contacts',
  },
};

export default function ContactsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-center">
      <h1 className="text-3xl font-bold mb-6">Контакти</h1>

      <p className="mb-4 text-gray-700">
        Ми завжди відкриті для зв’язку з нашими клієнтами. Якщо у вас виникли
        запитання, побажання або ви хочете дізнатися більше про товар — напишіть
        нам або зателефонуйте.
      </p>

      <div className="text-lg text-gray-800 space-y-4 my-8">
        <p>
          📧 <strong>Email:</strong>{' '}
          <a
            href="mailto:mobistuffinfo@gmail.com"
            className="text-blue-500 hover:underline"
          >
            mobistuffinfo@gmail.com
          </a>
        </p>

        {/* Можеш пізніше додати номер телефону тут */}
        {/* <p>📞 <strong>Телефон:</strong> +38 (098) 123-45-67</p> */}

        <p>
          🕓 <strong>Графік роботи:</strong> Понеділок – П’ятниця, 9:00 – 18:00
        </p>

        <p>
          📍 <strong>Доставка:</strong> Працюємо онлайн по всій Україні через
          Нову Пошту
        </p>
      </div>

      <p className="text-gray-600">
        Ваша думка важлива для нас. Якщо ви маєте відгук або ідею щодо
        покращення сервісу — ми з радістю вислухаємо вас. Разом створимо
        найкращий магазин аксесуарів для ґаджетів ❤️
      </p>
    </main>
  );
}
