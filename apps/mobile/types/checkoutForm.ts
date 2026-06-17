export type PaymentMethod = 'card' | 'cod';

export type SavedCheckoutProfile = {
  name: string;
  phone: string;
  email: string;
  city: string;
  cityRef: string;
  warehouse: string;
  warehouseRef: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutFieldKey =
  | 'name'
  | 'phone'
  | 'email'
  | 'city'
  | 'warehouse';

export type CheckoutFormErrors = Partial<Record<CheckoutFieldKey, string>>;

export type CheckoutTouchedFields = Partial<Record<CheckoutFieldKey, boolean>>;
