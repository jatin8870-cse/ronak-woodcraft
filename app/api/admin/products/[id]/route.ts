import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, productSchema } from "@/lib/api";
export const PUT = handle(async (req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  const d = productSchema.parse(await req.json());
  const p = await prisma.product.update({ where: { id: params.id }, data: { ...d, tag: d.tag || null, mrp: Math.max(d.mrp, d.price) } });
  return NextResponse.json(p);
});
export const DELETE = handle(async (_req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
