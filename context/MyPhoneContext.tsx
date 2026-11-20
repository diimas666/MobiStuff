'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Ctx = { phone: string | null; setPhone: (p: string | null) => void; pickerOpen: boolean; openPicker: () => void; closePicker: () => void };
const MyPhone = createContext<Ctx>({ phone: null, setPhone: () => {}, pickerOpen: false, openPicker: () => {}, closePicker: () => {} });
const KEY = 'ms_phone';

/** «Мій телефон»: модель зберігається в браузері, сайт підказує сумісні аксесуари */
export function MyPhoneProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhoneState] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setPhoneState(saved);
    } catch {
      // сховище недоступне
    }
  }, []);

  const setPhone = useCallback((p: string | null) => {
    setPhoneState(p);
    try {
      if (p) localStorage.setItem(KEY, p);
      else localStorage.removeItem(KEY);
    } catch {
      // ігноруємо
    }
  }, []);

  return (
    <MyPhone.Provider value={{ phone, setPhone, pickerOpen, openPicker: () => setPickerOpen(true), closePicker: () => setPickerOpen(false) }}>
      {children}
    </MyPhone.Provider>
  );
}

export const useMyPhone = () => useContext(MyPhone);
