import type { CheckoutFieldKey, CheckoutFormErrors } from '../types/checkoutForm';

type ValidateInput = {
  name: string;
  phone: string;
  email: string;
  city: string;
  cityRef: string;
  warehouse: string;
  warehouseRef: string;
};

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('380')) {
    return `+${digits}`;
  }

  if (digits.startsWith('0')) {
    return `+38${digits}`;
  }

  if (digits.length === 9) {
    return `+380${digits}`;
  }

  return value.trim();
}

export function validateName(value: string): string | undefined {
  const trimmed = value.trim();

  if (trimmed.length < 2) {
    return "Введіть ім'я (мінімум 2 символи)";
  }

  if (!/^[\p{L}\s'-]+$/u.test(trimmed)) {
    return "Ім'я може містити лише літери";
  }

  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return 'Введіть номер телефону';
  }

  const normalized = digits.startsWith('380')
    ? digits
    : digits.startsWith('0')
      ? `38${digits}`
      : `380${digits}`;

  if (normalized.length !== 12 || !normalized.startsWith('380')) {
    return 'Формат: +380 XX XXX XX XX';
  }

  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Некоректний email';
  }

  return undefined;
}

export function validateCity(city: string, cityRef: string): string | undefined {
  if (!city.trim()) {
    return 'Введіть місто';
  }

  if (!cityRef) {
    return 'Оберіть місто зі списку підказок';
  }

  return undefined;
}

export function validateWarehouse(
  warehouse: string,
  warehouseRef: string,
  cityRef: string,
): string | undefined {
  if (!cityRef) {
    return 'Спочатку оберіть місто';
  }

  if (!warehouse.trim()) {
    return 'Введіть відділення або поштомат';
  }

  if (!warehouseRef) {
    return 'Оберіть відділення зі списку підказок';
  }

  return undefined;
}

export function validateCheckoutField(
  field: CheckoutFieldKey,
  input: ValidateInput,
): string | undefined {
  switch (field) {
    case 'name':
      return validateName(input.name);
    case 'phone':
      return validatePhone(input.phone);
    case 'email':
      return validateEmail(input.email);
    case 'city':
      return validateCity(input.city, input.cityRef);
    case 'warehouse':
      return validateWarehouse(input.warehouse, input.warehouseRef, input.cityRef);
    default:
      return undefined;
  }
}

export function validateCheckoutForm(input: ValidateInput): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  const nameError = validateName(input.name);
  if (nameError) {
    errors.name = nameError;
  }

  const phoneError = validatePhone(input.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }

  const emailError = validateEmail(input.email);
  if (emailError) {
    errors.email = emailError;
  }

  const cityError = validateCity(input.city, input.cityRef);
  if (cityError) {
    errors.city = cityError;
  }

  const warehouseError = validateWarehouse(
    input.warehouse,
    input.warehouseRef,
    input.cityRef,
  );
  if (warehouseError) {
    errors.warehouse = warehouseError;
  }

  return errors;
}
