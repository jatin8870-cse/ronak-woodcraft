import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async () => {
  const denied = await guard(); if (denied) return denied;
  return NextResponse.json(await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
});
