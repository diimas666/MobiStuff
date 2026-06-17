import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadCheckoutProfile,
  saveCheckoutProfile,
} from '../services/checkoutProfileStorage';
import type {
  CheckoutFieldKey,
  CheckoutFormErrors,
  CheckoutTouchedFields,
  PaymentMethod,
} from '../types/checkoutForm';
import {
  normalizePhone,
  validateCheckoutField,
  validateCheckoutForm,
} from '../utils/checkoutValidation';
import { useDebouncedValue } from './useDebouncedValue';

export function useCheckoutForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [cityRef, setCityRef] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [warehouseRef, setWarehouseRef] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [touched, setTouched] = useState<CheckoutTouchedFields>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const formInput = useMemo(
    () => ({
      name,
      phone,
      email,
      city,
      cityRef,
      warehouse,
      warehouseRef,
    }),
    [name, phone, email, city, cityRef, warehouse, warehouseRef],
  );

  const allErrors = useMemo(() => validateCheckoutForm(formInput), [formInput]);

  const visibleErrors = useMemo(() => {
    const errors: CheckoutFormErrors = {};

    (Object.keys(allErrors) as CheckoutFieldKey[]).forEach(field => {
      if (submitAttempted || touched[field]) {
        errors[field] = allErrors[field];
      }
    });

    return errors;
  }, [allErrors, submitAttempted, touched]);

  const debouncedProfile = useDebouncedValue(
    {
      name: name.trim(),
      phone: normalizePhone(phone),
      email: email.trim(),
      city: city.trim(),
      cityRef,
      warehouse: warehouse.trim(),
      warehouseRef,
      paymentMethod,
    },
    700,
  );

  useEffect(() => {
    let isMounted = true;

    loadCheckoutProfile()
      .then(profile => {
        if (!isMounted || !profile) {
          return;
        }

        setName(profile.name);
        setPhone(profile.phone);
        setEmail(profile.email);
        setCity(profile.city);
        setCityRef(profile.cityRef);
        setWarehouse(profile.warehouse);
        setWarehouseRef(profile.warehouseRef);
        setPaymentMethod(profile.paymentMethod);
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isProfileLoaded) {
      return;
    }

    void saveCheckoutProfile(debouncedProfile).catch(() => {});
  }, [debouncedProfile, isProfileLoaded]);

  const touchField = useCallback((field: CheckoutFieldKey) => {
    setTouched(current => ({ ...current, [field]: true }));
  }, []);

  const validateForSubmit = useCallback(() => {
    setSubmitAttempted(true);
    const errors = validateCheckoutForm(formInput);
    return Object.keys(errors).length === 0;
  }, [formInput]);

  const persistProfile = useCallback(async () => {
    await saveCheckoutProfile({
      name: name.trim(),
      phone: normalizePhone(phone),
      email: email.trim(),
      city: city.trim(),
      cityRef,
      warehouse: warehouse.trim(),
      warehouseRef,
      paymentMethod,
    });
  }, [name, phone, email, city, cityRef, warehouse, warehouseRef, paymentMethod]);

  const getFieldError = useCallback(
    (field: CheckoutFieldKey) => visibleErrors[field],
    [visibleErrors],
  );

  const blurField = useCallback(
    (field: CheckoutFieldKey) => {
      touchField(field);

      if (field === 'phone' && phone.trim()) {
        setPhone(normalizePhone(phone));
      }
    },
    [phone, touchField],
  );

  return {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    city,
    setCity,
    cityRef,
    setCityRef,
    warehouse,
    setWarehouse,
    warehouseRef,
    setWarehouseRef,
    comment,
    setComment,
    paymentMethod,
    setPaymentMethod,
    touchField,
    blurField,
    validateForSubmit,
    persistProfile,
    getFieldError,
    isProfileLoaded,
  };
}
