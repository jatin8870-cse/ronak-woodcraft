import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, HttpError, code } from "@/lib/api";
import { publicOrder } from "@/lib/serialize";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const POST = handle(async (req) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new HttpError(503, "Payment verification is not configured.");

  const d = schema.parse(await req.json());
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { razorpayOrderId: d.razorpay_order_id },
  });
  if (!attempt) throw new HttpError(404, "Payment session not found.");

  // Idempotent response if Razorpay retries the same successful callback.
  if (attempt.status === "Paid" && attempt.orderCode) {
    const existing = await prisma.order.findUnique({
      where: { code: attempt.orderCode },
      include: { items: true },
    });
    if (existing) return NextResponse.json(publicOrder(existing));
  }

  const expected = createHmac("sha256", secret)
    .update(`${d.razorpay_order_id}|${d.razorpay_payment_id}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(d.razorpay_signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new HttpError(400, "Payment signature is invalid.");
  }

  // Confirm payment status and amount directly with Razorpay.
  const keyId = process.env.RAZORPAY_KEY_ID;
  const paymentResponse = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(d.razorpay_payment_id)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
      },
      cache: "no-store",
    }
  );
  const payment = await paymentResponse.json();
  if (
    !paymentResponse.ok ||
    payment.order_id !== attempt.razorpayOrderId ||
    payment.amount !== attempt.amount ||
    payment.currency !== attempt.currency ||
    payment.status !== "captured"
  ) {
    throw new HttpError(400, "Payment has not been confirmed by Razorpay.");
  }

  const payload = attempt.payload as {
    name: string;
    phone: string;
    address: string;
    coupon: string | null;
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
    items: { productId: string; name: string; price: number; qty: number }[];
  };

  const order = await prisma.$transaction(async (tx) => {
    const freshAttempt = await tx.paymentAttempt.findUnique({
      where: { id: attempt.id },
    });
    if (!freshAttempt) throw new HttpError(404, "Payment session not found.");
    if (freshAttempt.status === "Paid" && freshAttempt.orderCode) {
      const old = await tx.order.findUnique({
        where: { code: freshAttempt.orderCode },
        include: { items: true },
      });
      if (old) return old;
    }

    for (const item of payload.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.qty } },
        data: { stock: { decrement: item.qty } },
      });
      if (updated.count !== 1) {
        throw new HttpError(409, `Stock changed for "${item.name}". Contact support with your payment ID.`);
      }
    }

    const created = await tx.order.create({
      data: {
        code: code("OD"),
        name: payload.name,
        phone: payload.phone,
        address: payload.address,
        payment: "Razorpay",
        paymentStatus: "Paid",
        razorpayOrderId: attempt.razorpayOrderId,
        razorpayPaymentId: d.razorpay_payment_id,
        coupon: payload.coupon,
        subtotal: payload.subtotal,
        discount: payload.discount,
        delivery: payload.delivery,
        total: payload.total,
        userId: attempt.userId,
        items: {
          create: payload.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            qty: item.qty,
          })),
        },
      },
      include: { items: true },
    });

    await tx.paymentAttempt.update({
      where: { id: attempt.id },
      data: { status: "Paid", orderCode: created.code },
    });
    return created;
  });

  return NextResponse.json(publicOrder(order));
});
