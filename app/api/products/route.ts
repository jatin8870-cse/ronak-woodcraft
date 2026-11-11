import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async () => NextResponse.json(await prisma.product.findMany({ orderBy: { createdAt: "desc" } })));
