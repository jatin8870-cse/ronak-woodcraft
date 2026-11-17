import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { handle, HttpError } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = handle(async (req, { params }) => {
  const user = await getUser();
  const product = await prisma.product.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!product) throw new HttpError(404, "Product not found");
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 8, 1), 20);
  const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
  const where = { productId: params.id, approved: true };
  const [items, total, grouped, purchase, existing] = await Promise.all([
    prisma.productReview.findMany({ where, orderBy: { createdAt: "desc" }, skip: offset, take: limit, select: {
      id: true, rating: true, title: true, comment: true, images: true, videos: true, createdAt: true,
      user: { select: { name: true } }
    }}),
    prisma.productReview.count({ where }),
    prisma.productReview.groupBy({ by: ["rating"], where, _count: { _all: true } }),
    user ? prisma.orderItem.findFirst({ where: { productId: params.id, order: { userId: user.id, status: { not: "Cancelled" } } }, select: { id: true } }) : null,
    user ? prisma.productReview.findUnique({ where: { productId_userId: { productId: params.id, userId: user.id } }, select: { id: true } }) : null
  ]);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const g of grouped) { counts[g.rating] = g._count._all; sum += g.rating * g._count._all; }
  const summary = { average: total ? sum / total : 0, counts, total };
  return NextResponse.json({ items, total, summary, canReview: Boolean(purchase), alreadyReviewed: Boolean(existing), user: user ? { name: user.name } : null });
});

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).default(""),
  comment: z.string().trim().min(5).max(1500),
  images: z.array(z.string().url()).max(4).default([]),
  videos: z.array(z.string().url()).max(2).default([])
});

export const POST = handle(async (req, { params }) => {
  const user = await getUser();
  if (!user) throw new HttpError(401, "Please login to submit a review.");
  const data = schema.parse(await req.json());
  const purchase = await prisma.orderItem.findFirst({
    where: { productId: params.id, order: { userId: user.id, status: { not: "Cancelled" } } },
    select: { id: true }
  });
  if (!purchase) throw new HttpError(403, "Only verified purchasers can review this product.");
  const exists = await prisma.productReview.findUnique({ where: { productId_userId: { productId: params.id, userId: user.id } } });
  if (exists) throw new HttpError(409, "You have already reviewed this product.");
  const review = await prisma.productReview.create({ data: { ...data, productId: params.id, userId: user.id, approved: false } });
  return NextResponse.json({ ok: true, id: review.id, message: "Review sent for admin approval." }, { status: 201 });
});