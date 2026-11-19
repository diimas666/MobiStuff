'use client';

import Link from 'next/link';
import { policyTexts } from '@/data/storePolicies';
import { useStoreSettings } from '@/context/StoreSettingsContext';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function InfoPageLayout({
  title,
  subtitle,
  badge,
  children,
  ctaLabel = 'Перейти до каталогу',
  ctaHref = '/catalog',
}: InfoPageLayoutProps) {
  const { freeDeliveryFrom, cardOnlyFrom } = useStoreSettings();
  const storePolicies = { ...policyTexts(freeDeliveryFrom, cardOnlyFrom), paymentSummary: `Безкоштовна доставка від ${freeDeliveryFrom} грн. Замовлення від ${cardOnlyFrom} грн — тільки оплата карткою.` };
  return (
    <div className="pb-6">
      <header className="mx-auto max-w-4xl py-8 text-center sm:py-16">
        {badge && <p className="rise mb-4 text-[17px] font-semibold text-accent">{badge}</p>}
        <h1 className="display-xl rise" style={{ '--d': '80ms' } as React.CSSProperties}>
          {title}
        </h1>
        <p className="lead rise mx-auto mt-6 max-w-2xl" style={{ '--d': '180ms' } as React.CSSProperties}>
          {subtitle}
        </p>
      </header>

      <div className="info-body mx-auto max-w-5xl">{children}</div>

      <section className="panel mx-auto mt-16 max-w-5xl px-6 py-12 text-center sm:px-12">
        <h2 className="display-md">Готові обрати аксесуар?</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-ink-2">{storePolicies.paymentSummary}</p>
        <Link href={ctaHref} className="btn-primary btn-lg mt-7">
          {ctaLabel}
        </Link>
      </section>
    </div>
  );
}

export function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="tile p-6 sm:p-7">
      <div className="mb-5 text-accent [&_svg]:h-7 [&_svg]:w-7 [&_svg]:stroke-[1.5]">{icon}</div>
      <h3 className="mb-2 text-[19px] font-semibold tracking-tight">{title}</h3>
      <div className="text-[15px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function InfoHighlight({ value, label }: { value: string; label: string }) {
  return (
    <div className="tile px-4 py-8 text-center">
      <div className="mb-1 text-[34px] font-semibold tracking-tight sm:text-[44px]">{value}</div>
      <div className="text-[14px] text-ink-2">{label}</div>
    </div>
  );
}

export function InfoStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[14px] font-semibold text-white">
        {number}
      </div>
      <div>
        <h4 className="mb-1 text-[16px] font-semibold">{title}</h4>
        <p className="text-[15px] leading-relaxed text-ink-2">{children}</p>
      </div>
    </div>
  );
}
