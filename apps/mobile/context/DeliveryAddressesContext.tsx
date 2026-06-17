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
  loadDeliveryAddresses,
  saveDeliveryAddresses,
} from '../services/deliveryAddressesStorage';
import {
  generateDeliveryAddressId,
  type DeliveryAddress,
  type DeliveryAddressInput,
} from '../types/deliveryAddress';

const MAX_ADDRESSES = 10;

type DeliveryAddressesContextValue = {
  addresses: DeliveryAddress[];
  isHydrated: boolean;
  addAddress: (input: DeliveryAddressInput) => Promise<DeliveryAddress | null>;
  removeAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => DeliveryAddress | null;
};

const DeliveryAddressesContext = createContext<DeliveryAddressesContextValue | null>(null);

function normalizeDefault(addresses: DeliveryAddress[], preferredId?: string): DeliveryAddress[] {
  if (addresses.length === 0) {
    return addresses;
  }

  const defaultId = preferredId ?? addresses.find(item => item.isDefault)?.id ?? addresses[0].id;

  return addresses.map(item => ({
    ...item,
    isDefault: item.id === defaultId,
  }));
}

export function DeliveryAddressesProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadDeliveryAddresses()
      .then(stored => {
        if (isMounted) {
          setAddresses(normalizeDefault(stored));
        }
      })
      .catch(() => {
        if (isMounted) {
          setAddresses([]);
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

  const persistAddresses = useCallback(async (nextAddresses: DeliveryAddress[]) => {
    try {
      await saveDeliveryAddresses(nextAddresses);
    } catch {
      // Список у пам'яті залишається, навіть якщо збереження недоступне
    }
  }, []);

  const addAddress = useCallback(
    async (input: DeliveryAddressInput) => {
      if (addresses.length >= MAX_ADDRESSES) {
        return null;
      }

      const newAddress: DeliveryAddress = {
        id: generateDeliveryAddressId(),
        label: input.label.trim() || 'Адреса',
        city: input.city.trim(),
        cityRef: input.cityRef,
        warehouse: input.warehouse.trim(),
        warehouseRef: input.warehouseRef,
        isDefault: Boolean(input.isDefault),
        createdAt: new Date().toISOString(),
      };

      const withNew = normalizeDefault(
        [newAddress, ...addresses.filter(item => item.id !== newAddress.id)],
        input.isDefault ? newAddress.id : undefined,
      );

      setAddresses(withNew);
      await persistAddresses(withNew);
      return newAddress;
    },
    [addresses, persistAddresses],
  );

  const removeAddress = useCallback(
    async (id: string) => {
      const nextAddresses = normalizeDefault(addresses.filter(item => item.id !== id));
      setAddresses(nextAddresses);
      await persistAddresses(nextAddresses);
    },
    [addresses, persistAddresses],
  );

  const setDefaultAddress = useCallback(
    async (id: string) => {
      const nextAddresses = normalizeDefault(addresses, id);
      setAddresses(nextAddresses);
      await persistAddresses(nextAddresses);
    },
    [addresses, persistAddresses],
  );

  const getDefaultAddress = useCallback(() => {
    return addresses.find(item => item.isDefault) ?? addresses[0] ?? null;
  }, [addresses]);

  const value = useMemo(
    () => ({
      addresses,
      isHydrated,
      addAddress,
      removeAddress,
      setDefaultAddress,
      getDefaultAddress,
    }),
    [addAddress, addresses, getDefaultAddress, isHydrated, removeAddress, setDefaultAddress],
  );

  return (
    <DeliveryAddressesContext.Provider value={value}>
      {children}
    </DeliveryAddressesContext.Provider>
  );
}

export function useDeliveryAddresses() {
  const context = useContext(DeliveryAddressesContext);

  if (!context) {
    throw new Error('useDeliveryAddresses must be used within DeliveryAddressesProvider');
  }

  return context;
}
