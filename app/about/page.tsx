import { Metadata } from 'next';
import InfoPageLayout, { InfoCard, InfoHighlight } from '@/components/InfoPageLayout';
import { Award, Headphones, ShieldCheck, Sparkles, Truck, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Про нас | MobiStuff',
  description:
    'Дізнайтесь більше про магазин MobiStuff — наші цінності, переваги та підхід до якості. Ми прагнемо забезпечити найкращий вибір аксесуарів для вашої техніки.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <InfoPageLayout
      badge="MobiStuff"
      title="Аксесуари, яким можна довіряти"
      subtitle="Український інтернет-магазин мобільних аксесуарів. Ми відбираємо лише перевірені бренди, тримаємо чесні ціни та доставляємо по всій Україні."
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <InfoHighlight value="5000+" label="товарів у каталозі" />
        <InfoHighlight value="1–3 дні" label="доставка по Україні" />
        <InfoHighlight value="14 днів" label="на повернення" />
        <InfoHighlight value="24/7" label="онлайн-замовлення" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <InfoCard icon={<ShieldCheck className="w-5 h-5" />} title="Перевірена якість">
          Кожен товар проходить відбір у надійних постачальників. Ми працюємо з офіційними
          брендами: Borofone, Hoco, Baseus та іншими лідерами ринку.
        </InfoCard>
        <InfoCard icon={<Headphones className="w-5 h-5" />} title="Широкий асортимент">
          Чохли, кабелі, навушники, павербанки, автотримачі, захисне скло — все для вашого
          смартфона, планшета та ноутбука в одному місці.
        </InfoCard>
        <InfoCard icon={<Truck className="w-5 h-5" />} title="Швидка доставка">
          Відправляємо замовлення щодня. Нова Пошта по всій Україні — на відділення або
          кур&apos;єром до дверей.
        </InfoCard>
        <InfoCard icon={<Award className="w-5 h-5" />} title="Вигідні ціни">
          Регулярні акції, знижки на бренди та безкоштовна доставка від 2500 грн. Якість без
          переплат.
        </InfoCard>
        <InfoCard icon={<Users className="w-5 h-5" />} title="Підтримка клієнтів">
          Допоможемо обрати аксесуар, відповімо на питання до та після покупки. Ваш комфорт —
          наш пріоритет.
        </InfoCard>
        <InfoCard icon={<Sparkles className="w-5 h-5" />} title="Завжди в тренді">
          Оновлюємо каталог щодня. Новинки, хіти продажів і актуальні рішення для ваших
          гаджетів.
        </InfoCard>
      </div>

      <section className="rounded-2xl bg-gray-900 text-white px-6 py-8 sm:px-10 sm:py-10">
        <h2 className="text-xl font-bold mb-3">Наша місія</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Зробити сучасні технології доступними кожному. Ми віримо, що правильний аксесуар —
          це не лише захист техніки, а й стиль, зручність і впевненість у щоденному житті.
          Дякуємо, що обираєте <strong className="text-white">MobiStuff</strong>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
