import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, productSchema } from "@/lib/api";
export const POST = handle(async (req) => {
  const denied = await guard(); if (denied) return denied;
  const d = productSchema.parse(await req.json());
  const p = await prisma.product.create({ data: { ...d, tag: d.tag || null, mrp: Math.max(d.mrp, d.price) } });
  return NextResponse.json(p, { status: 201 });
});
