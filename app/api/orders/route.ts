import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, HttpError, phoneSchema, code } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
import { priceOrder } from "@/lib/pricing";
import { publicOrder } from "@/lib/serialize";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  address: z.string().trim().min(5, "Enter the full address").max(300),
  payment: z.enum(["Cash on delivery", "UPI", "Card"]),
  coupon: z.string().trim().max(30).optional(),
  items: z.array(z.object({ id: z.string(), qty: z.number().int().min(1).max(20) })).min(1, "Your cart is empty").max(30),
});

export const POST = handle(async (req) => {
  const d = schema.parse(await req.json());
  const userId = await optionalUserId();

  // merge lines of the same product
  const qtyById = new Map<string, number>();
  for (const i of d.items) qtyById.set(i.id, (qtyById.get(i.id) ?? 0) + i.qty);

  // Prices come from the server, never from the browser
  const products = await prisma.product.findMany({ where: { id: { in: [...qtyById.keys()] } } });
  if (products.length !== qtyById.size) throw new HttpError(400, "A product in your cart is no longer available. Please refresh your cart.");

  const subtotal = products.reduce((s, p) => s + p.price * qtyById.get(p.id)!, 0);
  let percent = 0, couponCode: string | null = null;
  if (d.coupon) {
    const c = await prisma.coupon.findUnique({ where: { code: d.coupon.toUpperCase() } });
    if (!c || !c.active) throw new HttpError(400, "This coupon is not valid");
    percent = c.percent; couponCode = c.code;
  }
  const { discount, delivery, total } = priceOrder(subtotal, percent);

  const order = await prisma.$transaction(async (tx) => {
    for (const p of products) {
      const r = await tx.product.updateMany({ where: { id: p.id, stock: { gte: qtyById.get(p.id)! } }, data: { stock: { decrement: qtyById.get(p.id)! } } });
      if (r.count === 0) throw new HttpError(409, `Not enough stock available for "${p.name}"`);
    }
    return tx.order.create({
      data: {
        code: code("OD"), name: d.name, phone: d.phone, address: d.address, payment: d.payment, coupon: couponCode,
        subtotal, discount, delivery, total, userId,
        items: { create: products.map((p) => ({ productId: p.id, name: p.name, price: p.price, qty: qtyById.get(p.id)! })) },
      },
      include: { items: true },
    });
  });
  return NextResponse.json(publicOrder(order), { status: 201 });
});
