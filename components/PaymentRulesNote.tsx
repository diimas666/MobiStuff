import { storePolicies } from '@/data/storePolicies';
import { CreditCard, Gift } from 'lucide-react';

interface PaymentRulesNoteProps {
  variant?: 'light' | 'dark' | 'inline';
}

export default function PaymentRulesNote({ variant = 'light' }: PaymentRulesNoteProps) {
  if (variant === 'inline') {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        {storePolicies.paymentSummary}
      </p>
    );
  }

  const isDark = variant === 'dark';

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 sm:gap-6 rounded-xl px-4 py-3 text-sm ${
        isDark
          ? 'bg-white/10 border border-white/10 text-gray-200'
          : 'bg-green-50 border border-green-100 text-green-900'
      }`}
    >
      <span className="flex items-start gap-2">
        <Gift className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        {storePolicies.freeDelivery}
      </span>
      <span className={`hidden sm:block w-px ${isDark ? 'bg-white/20' : 'bg-green-200'}`} />
      <span className="flex items-start gap-2">
        <CreditCard className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        {storePolicies.cardOnly}
      </span>
    </div>
  );
}
