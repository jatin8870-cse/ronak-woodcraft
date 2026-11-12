
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, advertisementSchema } from "@/lib/api";

export const POST = handle(async (req) => {
  const denied = await guard();
  if (denied) return denied;

  const d = advertisementSchema.parse(await req.json());

  const advertisement = await prisma.advertisement.create({
    data: {
      ...d,
      couponCode: d.couponCode || null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
    },
  });

  return NextResponse.json(advertisement, { status: 201 });
});
