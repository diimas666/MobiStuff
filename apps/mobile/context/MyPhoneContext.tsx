import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { getStorageItem, removeStorageItem, setStorageItem } from '../services/safeStorage';

type Ctx = {
  phone: string | null;
  setPhone: (p: string | null) => void;
  pickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
};

const MyPhone = createContext<Ctx>({ phone: null, setPhone: () => {}, pickerOpen: false, openPicker: () => {}, closePicker: () => {} });
const KEY = 'my_phone_model';

/** «Мій телефон»: модель зберігається на пристрої, застосунок підказує сумісні аксесуари */
export function MyPhoneProvider({ children }: { children: ReactNode }) {
  const [phone, setPhoneState] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    void getStorageItem(KEY).then(v => v && setPhoneState(v));
  }, []);

  const setPhone = useCallback((p: string | null) => {
    setPhoneState(p);
    void (p ? setStorageItem(KEY, p) : removeStorageItem(KEY));
  }, []);

  return (
    <MyPhone.Provider value={{ phone, setPhone, pickerOpen, openPicker: () => setPickerOpen(true), closePicker: () => setPickerOpen(false) }}>
      {children}
    </MyPhone.Provider>
  );
}

export const useMyPhone = () => useContext(MyPhone);
