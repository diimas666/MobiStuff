import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout, { InfoCard, InfoStep } from '@/components/InfoPageLayout';
import PaymentRulesNote from '@/components/PaymentRulesNote';
import { CARD_ONLY_FROM, FREE_DELIVERY_FROM, storePolicies } from '@/data/storePolicies';
import { Banknote, CreditCard, Gift, MapPin, Package, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Доставка і оплата | MobiStuff',
  description:
    'Дізнайтесь про доставку Новою Поштою, оплату карткою або післяплатою до 4000 грн, безкоштовну доставку від 2500 грн.',
  alternates: { canonical: '/delivery' },
};

export default function DeliveryPage() {
  return (
    <InfoPageLayout
      badge="Доставка"
      title="Швидко. Зручно. По всій Україні"
      subtitle={`Відправляємо щодня через Нову Пошту. ${storePolicies.codAvailable}. ${storePolicies.cardOnly}.`}
      ctaLabel="Оформити замовлення"
      ctaHref="/"
    >
      <div className="mb-6">
        <PaymentRulesNote />
      </div>

      <div className="rounded-2xl bg-green-50 border border-green-100 px-6 py-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Gift className="w-8 h-8 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-lg">
            Безкоштовна доставка від {FREE_DELIVERY_FROM} грн
          </p>
          <p className="text-green-700 text-sm mt-1">
            Нова Пошта та Укрпошта — на відділення по всій Україні
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Як ми доставляємо</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={<Truck className="w-5 h-5" />} title="Нова Пошта">
          <ul className="space-y-1.5 mt-1">
            <li>• Термін: <strong>1–3 робочих дні</strong></li>
            <li>• На відділення або кур&apos;єром</li>
            <li>• Відстеження посилки онлайн</li>
            <li>• Відправка щодня до <strong>17:00</strong></li>
          </ul>
        </InfoCard>
        <InfoCard icon={<MapPin className="w-5 h-5" />} title="По всій Україні">
          <ul className="space-y-1.5 mt-1">
            <li>• Київ, Львів, Одеса, Харків та всі міста</li>
            <li>• Села та селища — через відділення НП</li>
            <li>• Зручний вибір відділення при оформленні</li>
          </ul>
        </InfoCard>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Способи оплати</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <InfoCard icon={<CreditCard className="w-5 h-5" />} title="Онлайн-оплата карткою">
          Visa / MasterCard через захищений платіжний сервіс.{' '}
          <strong>Обов&apos;язкова для замовлень від {CARD_ONLY_FROM} грн</strong> — повна
          передоплата на картку.
        </InfoCard>
        <InfoCard icon={<Banknote className="w-5 h-5" />} title="Оплата при отриманні">
          Післяплата через Нову Пошту — доступна для замовлень{' '}
          <strong>до {CARD_ONLY_FROM} грн</strong>. Комісія згідно тарифів перевізника.
        </InfoCard>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-green-500" />
          Як проходить замовлення
        </h2>
        <div className="space-y-6">
          <InfoStep number={1} title="Оформлення">
            Додайте товари в кошик, вкажіть контакти та адресу доставки Новою Поштою.
          </InfoStep>
          <InfoStep number={2} title="Підтвердження">
            Ми обробляємо замовлення та відправляємо протягом 1 робочого дня.
          </InfoStep>
          <InfoStep number={3} title="Отримання">
            Ви отримуєте SMS від Нової Пошти та забираєте посилку у зручний час.
          </InfoStep>
        </div>
      </section>

      <p className="text-center text-gray-600 text-sm">
        Є питання?{' '}
        <Link href="/contacts" className="text-green-600 font-medium hover:underline">
          Зв&apos;яжіться з нами
        </Link>{' '}
        — відповімо протягом робочого дня.
      </p>
    </InfoPageLayout>
  );
}
