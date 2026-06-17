import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loadPaymentMethodsSettings,
  savePaymentMethodsSettings,
} from '../services/paymentMethodsStorage';
import type { PaymentMethodType } from '../types/paymentMethods';

type PaymentMethodsContextValue = {
  defaultMethod: PaymentMethodType;
  isHydrated: boolean;
  setDefaultMethod: (method: PaymentMethodType) => Promise<void>;
};

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null);

export function PaymentMethodsProvider({ children }: { children: ReactNode }) {
  const [defaultMethod, setDefaultMethodState] = useState<PaymentMethodType>('card_transfer');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadPaymentMethodsSettings()
      .then(settings => {
        if (!isMounted) {
          return;
        }

        setDefaultMethodState(settings.defaultMethod);
      })
      .catch(() => {
        if (isMounted) {
          setDefaultMethodState('card_transfer');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setDefaultMethod = useCallback(async (method: PaymentMethodType) => {
    setDefaultMethodState(method);

    try {
      await savePaymentMethodsSettings({ defaultMethod: method });
    } catch {
      // Налаштування залишаються в пам'яті
    }
  }, []);

  const value = useMemo(
    () => ({
      defaultMethod,
      isHydrated,
      setDefaultMethod,
    }),
    [defaultMethod, isHydrated, setDefaultMethod],
  );

  return (
    <PaymentMethodsContext.Provider value={value}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethods() {
  const context = useContext(PaymentMethodsContext);

  if (!context) {
    throw new Error('usePaymentMethods must be used within PaymentMethodsProvider');
  }

  return context;
}
