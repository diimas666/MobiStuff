export const FREE_DELIVERY_FROM = 2500;
export const CARD_ONLY_FROM = 4000;

export const storePolicies = {
  freeDelivery: `Безкоштовна доставка від ${FREE_DELIVERY_FROM} грн по Україні`,
  cardOnly: `Замовлення від ${CARD_ONLY_FROM} грн — повна оплата на картку (Visa / MasterCard)`,
  codAvailable: `До ${CARD_ONLY_FROM} грн доступна оплата при отриманні (післяплата)`,
  paymentSummary: `Безкоштовна доставка від ${FREE_DELIVERY_FROM} грн. Замовлення від ${CARD_ONLY_FROM} грн — тільки оплата карткою онлайн.`,
} as const;

/** Тексти умов з урахуванням налаштувань з адмінки */
export function policyTexts(freeFrom: number = FREE_DELIVERY_FROM, cardFrom: number = CARD_ONLY_FROM) {
  return {
    freeDelivery: `Безкоштовна доставка від ${freeFrom} грн по Україні`,
    cardOnly: `Замовлення від ${cardFrom} грн — повна оплата на картку (Visa / MasterCard)`,
    codAvailable: `До ${cardFrom} грн доступна оплата при отриманні (післяплата)`,
  };
}
