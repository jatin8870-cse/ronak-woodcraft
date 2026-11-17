import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, HttpError } from "@/lib/api";
export const POST = handle(async (req) => {
  const { code } = z.object({ code: z.string().trim().min(1).max(30) }).parse(await req.json());
  const c = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!c || !c.active) throw new HttpError(404, "This coupon is not valid");
  return NextResponse.json({ code: c.code, percent: c.percent });
});
