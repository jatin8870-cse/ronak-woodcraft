
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, advertisementSchema } from "@/lib/api";

export const PUT = handle(async (req, { params }) => {
  const denied = await guard();
  if (denied) return denied;

  const d = advertisementSchema.parse(await req.json());

  const advertisement = await prisma.advertisement.update({
    where: { id: params.id },
    data: {
      ...d,
      couponCode: d.couponCode || null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
    },
  });

  return NextResponse.json(advertisement);
});

export const DELETE = handle(async (_req, { params }) => {
  const denied = await guard();
  if (denied) return denied;

  await prisma.advertisement.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ ok: true });
});
