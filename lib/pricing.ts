// Used by both client and server so the total always matches.
export const FREE_DELIVERY_ABOVE = 5000;
export const DELIVERY_FEE = 299;
export function priceOrder(subtotal: number, percent: number) {
  const discount = Math.round((subtotal * percent) / 100);
  const after = subtotal - discount;
  const delivery = subtotal === 0 || after > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  return { discount, delivery, total: after + delivery };
}
