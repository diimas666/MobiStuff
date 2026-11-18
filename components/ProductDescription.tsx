'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ProductDescription({ html }: { html: string }) {
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > 340);
  }, [html]);

  return (
    <div>
      <div
        ref={ref}
        className={`prose-product relative overflow-hidden transition-[max-height] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? 'max-h-[4000px]' : 'max-h-[320px]'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: html }} />
        {overflowing && !open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {overflowing && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="link-more mt-3 text-[15px]" aria-expanded={open}>
          {open ? 'Згорнути' : 'Читати повністю'}
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
