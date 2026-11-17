import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async (_req, { params }) => {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) throw new HttpError(404, "Product not found");
  return NextResponse.json(product);
});
