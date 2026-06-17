'use client';

import Link from 'next/link';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  showError?: boolean;
};

export default function CheckoutConsentCheckbox({ checked, onChange, showError }: Props) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-500/40 shrink-0"
          required
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          Я погоджуюсь на{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="text-green-600 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            обробку моїх персональних даних
          </Link>{' '}
          відповідно до{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="text-green-600 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Політики конфіденційності
          </Link>{' '}
          <span className="text-red-500">*</span>
        </span>
      </label>
      {showError ? (
        <p className="mt-1.5 text-xs text-red-500">Потрібна згода на обробку персональних даних</p>
      ) : null}
    </div>
  );
}
