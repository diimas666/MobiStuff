export type PaymentMethodType =
  | 'card_transfer'
  | 'stripe'
  | 'google_pay'
  | 'apple_pay'
  | 'cod';

export type PaymentMethodSettings = {
  defaultMethod: PaymentMethodType;
};

export const PAYMENT_METHOD_META: Record<
  PaymentMethodType,
  {
    title: string;
    description: string;
    icon: string;
    available: boolean;
  }
> = {
  card_transfer: {
    title: 'Переказ на картку',
    description: 'Оплата за реквізитами після оформлення',
    icon: 'card-outline',
    available: true,
  },
  stripe: {
    title: 'Stripe',
    description: 'Швидка оплата карткою через Stripe',
    icon: 'flash-outline',
    available: false,
  },
  google_pay: {
    title: 'Google Pay',
    description: 'Оплата в один дотик через Google',
    icon: 'logo-google',
    available: false,
  },
  apple_pay: {
    title: 'Apple Pay',
    description: 'Оплата через Apple Pay',
    icon: 'logo-apple',
    available: false,
  },
  cod: {
    title: 'Оплата при отриманні',
    description: 'Накладений платіж у відділенні',
    icon: 'cash-outline',
    available: true,
  },
};

export function mapPaymentMethodToCheckout(method: PaymentMethodType): 'card' | 'cod' {
  return method === 'cod' ? 'cod' : 'card';
}

export function mapPaymentMethodToOrder(method: PaymentMethodType): string {
  switch (method) {
    case 'cod':
      return 'cod';
    case 'stripe':
      return 'stripe';
    case 'google_pay':
      return 'google_pay';
    case 'apple_pay':
      return 'apple_pay';
    case 'card_transfer':
    default:
      return 'card_online';
  }
}

export function formatPaymentMethodLabel(method: PaymentMethodType | string): string {
  if (method in PAYMENT_METHOD_META) {
    return PAYMENT_METHOD_META[method as PaymentMethodType].title;
  }

  if (method === 'card_online') {
    return PAYMENT_METHOD_META.card_transfer.title;
  }

  return String(method);
}
