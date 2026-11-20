import type { Metadata } from 'next';
import { Suspense } from 'react';
import TrackingForm from './TrackingForm';

export const metadata: Metadata = {
  title: 'Відстежити посилку',
  description: 'Статус посилки Нової Пошти за номером ТТН — де ваше замовлення зараз.',
  alternates: { canonical: '/tracking' },
};

export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-2xl pb-16">
      <h1 className="display-lg">Де моя посилка?</h1>
      <p className="lead mt-4">Введіть номер ТТН з SMS чи листа — покажемо статус від Нової Пошти.</p>
      <Suspense fallback={null}>
        <TrackingForm />
      </Suspense>
    </div>
  );
}
