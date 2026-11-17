import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle, projectSchema } from "@/lib/api";
export const POST = handle(async (req) => {
  const denied = await guard(); if (denied) return denied;
  return NextResponse.json(await prisma.project.create({ data: projectSchema.parse(await req.json()) }), { status: 201 });
});
