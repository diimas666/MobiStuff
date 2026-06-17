export type DeliveryAddress = {
  id: string;
  label: string;
  city: string;
  cityRef: string;
  warehouse: string;
  warehouseRef: string;
  isDefault: boolean;
  createdAt: string;
};

export type DeliveryAddressInput = {
  label: string;
  city: string;
  cityRef: string;
  warehouse: string;
  warehouseRef: string;
  isDefault?: boolean;
};

export function formatDeliveryAddressLine(address: DeliveryAddress): string {
  return `${address.city} · ${address.warehouse}`;
}

export function generateDeliveryAddressId(): string {
  return `ADDR-${Date.now().toString(36).toUpperCase()}`;
}
