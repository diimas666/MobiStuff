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
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-[#138a47]"
          required
        />
        <span className="text-[13px] text-ink-2 leading-relaxed">
          Я погоджуюсь на{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            обробку моїх персональних даних
          </Link>{' '}
          відповідно до{' '}
          <Link
            href="/privacy"
            target="_blank"
            className="text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Політики конфіденційності
          </Link>{' '}
          
        </span>
      </label>
      {showError ? (
        <p className="mt-1.5 text-xs text-sale">Потрібна згода на обробку персональних даних</p>
      ) : null}
    </div>
  );
}
