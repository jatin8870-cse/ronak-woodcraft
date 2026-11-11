import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, HttpError } from "@/lib/api";
export const PATCH = handle(async (req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  const { status } = z.object({ status: z.enum(["Placed", "Packed", "Delivered", "Cancelled"]) }).parse(await req.json());
  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!o) throw new HttpError(404, "Order not found");
    // Restore stock when an order is cancelled
    if (status === "Cancelled" && o.status !== "Cancelled") {
      for (const i of o.items) if (i.productId) await tx.product.updateMany({ where: { id: i.productId }, data: { stock: { increment: i.qty } } });
    }
    return tx.order.update({ where: { id: o.id }, data: { status }, include: { items: true } });
  });
  return NextResponse.json(updated);
});
