import type { Order, OrderItem, Booking } from "@prisma/client";

export const publicOrder = (o: Order & { items: OrderItem[] }) => ({
  id: o.code, date: o.createdAt.toLocaleDateString("en-IN"), total: o.total,
  items: o.items.reduce((s, i) => s + i.qty, 0), payment: o.payment, address: o.address, status: o.status, 
lines: o.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
subtotal: o.subtotal, discount: o.discount, delivery: o.delivery, coupon: o.coupon,
});
export const publicBooking = (b: Booking) => ({
  id: b.code, service: b.service, date: b.date, slot: b.slot, address: b.address, phone: b.phone, notes: b.notes, status: b.status,
});
