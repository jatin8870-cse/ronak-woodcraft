import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, HttpError, normalizePhone } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
// Cancel with booking ID + phone, or (when logged in) any booking linked to the account.
export const POST = handle(async (req) => {
  const { id, phone } = z.object({ id: z.string().max(30), phone: z.string().max(20).optional() }).parse(await req.json());
  const userId = await optionalUserId();
  const who = [...(phone ? [{ phone: normalizePhone(phone) }] : []), ...(userId ? [{ userId }] : [])];
  if (!who.length) throw new HttpError(404, "Booking could not be cancelled");
  const r = await prisma.booking.updateMany({ where: { code: id, status: "Confirmed", OR: who }, data: { status: "Cancelled" } });
  if (r.count === 0) throw new HttpError(404, "Booking could not be cancelled");
  return NextResponse.json({ ok: true });
});
