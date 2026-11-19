import { pluralGoods } from '../../utils/plural';
import { AVAILABLE_PAYMENT_METHODS, mapPaymentMethodToOrder } from '../../types/paymentMethods';
import { getOrderAccessToken, saveOrderAccessToken } from '../../services/orderAccessStorage';

describe('pluralGoods', () => {
  it.each([
    [1, '1 товар'],
    [2, '2 товари'],
    [4, '4 товари'],
    [5, '5 товарів'],
    [11, '11 товарів'],
    [12, '12 товарів'],
    [21, '21 товар'],
    [22, '22 товари'],
    [111, '111 товарів'],
  ])('%i → %s', (n, expected) => {
    expect(pluralGoods(n)).toBe(expected);
  });
});

describe('оплата', () => {
  it('переказ на картку надсилається на сервер як card (раніше записувався як післяплата)', () => {
    expect(mapPaymentMethodToOrder('card_transfer')).toBe('card');
    expect(mapPaymentMethodToOrder('cod')).toBe('cod');
  });

  it('у списку лише доступні способи', () => {
    expect(AVAILABLE_PAYMENT_METHODS).toEqual(['card_transfer', 'cod']);
  });
});

describe('ключ доступу до замовлень', () => {
  beforeAll(() => {
    // Глобальний мок AsyncStorage нічого не зберігає — тут робимо справжнє сховище в памʼяті
    const AsyncStorage = jest.requireMock('@react-native-async-storage/async-storage');
    const mem = new Map<string, string>();
    AsyncStorage.setItem.mockImplementation(async (k: string, v: string) => void mem.set(k, v));
    AsyncStorage.getItem.mockImplementation(async (k: string) => mem.get(k) ?? null);
    AsyncStorage.removeItem.mockImplementation(async (k: string) => void mem.delete(k));
  });

  it('зберігається за номером незалежно від формату', async () => {
    await saveOrderAccessToken('+380 99 111 22 33', 'v1.token');
    expect(await getOrderAccessToken('0991112233')).toBe('v1.token');
    expect(await getOrderAccessToken('0997778899')).toBeNull();
  });
});
