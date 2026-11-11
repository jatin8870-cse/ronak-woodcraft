import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle } from "@/lib/api";
export const PATCH = handle(async (req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  const { status } = z.object({ status: z.enum(["Confirmed", "Completed", "Cancelled"]) }).parse(await req.json());
  return NextResponse.json(await prisma.booking.update({ where: { id: params.id }, data: { status } }));
});
