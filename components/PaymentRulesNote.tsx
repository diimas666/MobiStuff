import { storePolicies } from '@/data/storePolicies';
import { CreditCard, Truck } from 'lucide-react';

interface PaymentRulesNoteProps {
  variant?: 'light' | 'dark' | 'inline';
}

export default function PaymentRulesNote({ variant = 'light' }: PaymentRulesNoteProps) {
  if (variant === 'inline') {
    return <p className="text-sm leading-relaxed text-ink-2">{storePolicies.paymentSummary}</p>;
  }

  const isDark = variant === 'dark';

  return (
    <ul
      className={`flex flex-col gap-2.5 text-[13px] leading-snug ${
        isDark ? 'text-white/75' : 'text-ink-2'
      }`}
    >
      <li className="flex items-start gap-2.5">
        <Truck className={`mt-px h-4 w-4 shrink-0 ${isDark ? 'text-accent-bright' : 'text-accent'}`} />
        <span>{storePolicies.freeDelivery}</span>
      </li>
      <li className="flex items-start gap-2.5">
        <CreditCard className={`mt-px h-4 w-4 shrink-0 ${isDark ? 'text-accent-bright' : 'text-accent'}`} />
        <span>{storePolicies.cardOnly}</span>
      </li>
    </ul>
  );
}
