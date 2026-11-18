import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout from '@/components/InfoPageLayout';
import { privacyPolicyMeta, privacyPolicySections } from '@/data/privacyPolicyUa';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Політика конфіденційності | MobiStuff',
  description:
    'Політика конфіденційності інтернет-магазину MobiStuff. Порядок збору, обробки та захисту персональних даних відповідно до законодавства України.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      badge="Конфіденційність"
      title="Політика конфіденційності"
      subtitle="Як ми збираємо, використовуємо та захищаємо ваші персональні дані відповідно до законодавства України."
      ctaLabel="Перейти до каталогу"
      ctaHref="/"
    >
      <p className="text-sm text-ink-3 mb-8">
        Останнє оновлення: {privacyPolicyMeta.lastUpdated}
      </p>

      <div className="space-y-6">
        {privacyPolicySections.map((section) => (
          <section
            key={section.title}
            className="panel p-6 sm:p-10"
          >
            <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent shrink-0" />
              {section.title}
            </h2>
            <div className="space-y-3 text-sm text-ink-2 leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="list-disc pl-5 space-y-1.5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <p className="text-center text-sm text-ink-3 mt-10">
        Питання щодо персональних даних?{' '}
        <a
          href={`mailto:${privacyPolicyMeta.email}`}
          className="text-accent hover:underline"
        >
          {privacyPolicyMeta.email}
        </a>
        {' · '}
        <Link href="/contacts" className="text-accent hover:underline">
          Контакти
        </Link>
      </p>
    </InfoPageLayout>
  );
}
