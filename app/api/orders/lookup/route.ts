import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, normalizePhone } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
import { publicOrder } from "@/lib/serialize";

// A visitor sees orders by order ID + phone (this browser's orders).
// A logged-in customer also sees every order linked to their account.
export const POST = handle(async (req) => {
  const { refs } = z.object({ refs: z.array(z.object({ id: z.string().max(30), phone: z.string().max(20) })).max(50) }).parse(await req.json());
  const userId = await optionalUserId();
  const or = [...refs.map((r) => ({ code: r.id, phone: normalizePhone(r.phone) })), ...(userId ? [{ userId }] : [])];
  if (!or.length) return NextResponse.json([]);
  const orders = await prisma.order.findMany({ where: { OR: or }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders.map(publicOrder));
});
