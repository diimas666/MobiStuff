import { useCallback, useEffect, useState } from 'react';
import { api } from '../config/api';
import { loadCheckoutProfile } from '../services/checkoutProfileStorage';
import { getOrderAccessToken } from '../services/orderAccessStorage';
import { normalizePhone } from '../utils/checkoutValidation';

export type Loyalty = {
  /** null — номер ще не підтверджено кодом з SMS */
  balance: number | null;
  phone: string;
  token: string | null;
  cashbackPercent: number;
  maxPointsPercent: number;
  history: { at: string; delta: number; reason: string }[];
  reload: () => void;
};

/** Бали кешбеку (видно після підтвердження номера кодом з SMS) */
export function useLoyalty(): Loyalty {
  const [state, setState] = useState<Omit<Loyalty, 'reload'>>({ balance: null, phone: '', token: null, cashbackPercent: 3, maxPointsPercent: 30, history: [] });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const profile = await loadCheckoutProfile();
      const phone = profile?.phone ? normalizePhone(profile.phone) : '';
      const token = phone ? await getOrderAccessToken(phone) : null;
      if (!phone || !token) {
        if (alive) setState(s => ({ ...s, phone, token: null, balance: null }));
        return;
      }
      const r = await api.points({ phone, token }).catch(() => null);
      const d = r && r.ok ? await r.json().catch(() => null) : null;
      if (alive && d) setState({ balance: d.balance, phone, token, cashbackPercent: d.cashbackPercent, maxPointsPercent: d.maxPointsPercent, history: d.history ?? [] });
    })();
    return () => {
      alive = false;
    };
  }, [tick]);

  return { ...state, reload };
}
