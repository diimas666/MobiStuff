// app/delivery/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Доставка і оплата | MobiStuff',
  description:
    'Дізнайтесь про доставку Новою Поштою, оплату онлайн або післяплатою, строки відправки та безкоштовну доставку від 1500 грн.',
  alternates: {
    canonical: '/delivery',
  },
};

export default function DeliveryPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-left">
      <h1 className="text-3xl font-bold mb-6 text-center">Доставка і оплата</h1>

      <p className="mb-6 text-gray-700 text-lg text-center">
        Ми прагнемо зробити процес доставки максимально зручним для вас.
        Ознайомтесь з умовами доставки та доступними способами оплати нижче:
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">🚚 Доставка</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-800">
          <li>
            Доставка по всій Україні через <strong>Нову Пошту</strong>
          </li>
          <li>
            Термін доставки: <strong>1–3 робочих дні</strong>
          </li>
          <li>
            Відправка замовлень: <strong>щодня до 17:00</strong>
          </li>
          <li>
            <strong>Безкоштовна доставка</strong> при замовленні від{' '}
            <strong>2500 грн</strong>
          </li>
          <li>Можливість доставки на відділення або кур&apos;єром</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">💳 Оплата</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-800">
          <li>
            Онлайн-оплата карткою <strong>Visa / MasterCard</strong>
          </li>
          <li>
            Оплата при отриманні (післяплата) —{' '}
            <em>згідно тарифів Нової Пошти</em>
          </li>
          <li>Безпечні платежі через захищені сервіси</li>
          <li>Всі ціни на сайті — у гривнях з ПДВ</li>
        </ul>
      </section>

      <p className="mt-10 text-center text-gray-600">
        Якщо у вас є питання щодо доставки чи оплати —{' '}
        <strong>зв&apos;яжіться з нами</strong>, ми з радістю допоможемо!
      </p>
    </main>
  );
}
