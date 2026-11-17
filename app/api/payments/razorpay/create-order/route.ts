import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, HttpError, phoneSchema } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
import { priceOrder } from "@/lib/pricing";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  address: z.string().trim().min(5).max(300),
  coupon: z.string().trim().max(30).optional(),
  items: z.array(z.object({
    id: z.string().min(1),
    qty: z.number().int().min(1).max(20),
  })).min(1).max(30),
});

export const POST = handle(async (req) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new HttpError(503, "Online payment is not configured. Please use Cash on Delivery.");
  }

  const d = schema.parse(await req.json());
  const qtyById = new Map<string, number>();
  for (const item of d.items) {
    qtyById.set(item.id, (qtyById.get(item.id) ?? 0) + item.qty);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...qtyById.keys()] } },
  });
  if (products.length !== qtyById.size) {
    throw new HttpError(400, "A product is no longer available. Refresh your cart.");
  }
  for (const p of products) {
    if (p.stock < qtyById.get(p.id)!) {
      throw new HttpError(409, `Not enough stock for "${p.name}".`);
    }
  }

  const subtotal = products.reduce(
    (sum, p) => sum + p.price * qtyById.get(p.id)!,
    0
  );

  let percent = 0;
  let couponCode: string | null = null;
  if (d.coupon) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: d.coupon.toUpperCase() },
    });
    if (!coupon || !coupon.active) throw new HttpError(400, "Coupon is not valid.");
    percent = coupon.percent;
    couponCode = coupon.code;
  }

  const totals = priceOrder(subtotal, percent);
  if (!Number.isSafeInteger(totals.total) || totals.total <= 0) {
    throw new HttpError(400, "Invalid payment amount.");
  }

  const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: totals.total * 100,
      currency: "INR",
      receipt: `rwc_${Date.now()}`,
      notes: { customerName: d.name, customerPhone: d.phone },
    }),
    cache: "no-store",
  });

  const razorpayOrder = await razorpayResponse.json();
  if (!razorpayResponse.ok || !razorpayOrder.id) {
    console.error("Razorpay order creation failed:", razorpayOrder);
    throw new HttpError(502, "Could not start payment. Please try again.");
  }

  const userId = await optionalUserId();
  await prisma.paymentAttempt.create({
    data: {
      razorpayOrderId: razorpayOrder.id,
      amount: totals.total * 100,
      currency: "INR",
      userId,
      payload: {
        name: d.name,
        phone: d.phone,
        address: d.address,
        coupon: couponCode,
        subtotal,
        discount: totals.discount,
        delivery: totals.delivery,
        total: totals.total,
        items: products.map((p) => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          qty: qtyById.get(p.id)!,
        })),
      },
    },
  });

  return NextResponse.json({
    keyId,
    orderId: razorpayOrder.id,
    amount: totals.total * 100,
    currency: "INR",
    customer: { name: d.name, contact: d.phone },
  });
});
