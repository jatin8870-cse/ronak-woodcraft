import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, projectSchema } from "@/lib/api";
export const PUT = handle(async (req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  return NextResponse.json(await prisma.project.update({ where: { id: params.id }, data: projectSchema.parse(await req.json()) }));
});
export const DELETE = handle(async (_req, { params }) => {
  const denied = await guard(); if (denied) return denied;
  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
});
