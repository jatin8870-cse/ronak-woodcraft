import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, normalizePhone } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
import { publicBooking } from "@/lib/serialize";
export const POST = handle(async (req) => {
  const { refs } = z.object({ refs: z.array(z.object({ id: z.string().max(30), phone: z.string().max(20) })).max(50) }).parse(await req.json());
  const userId = await optionalUserId();
  const or = [...refs.map((r) => ({ code: r.id, phone: normalizePhone(r.phone) })), ...(userId ? [{ userId }] : [])];
  if (!or.length) return NextResponse.json([]);
  const list = await prisma.booking.findMany({ where: { OR: or }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(list.map(publicBooking));
});
