import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

// GET /api/reviews?limit=6&cursor=<reviewId>
// Sirf approved reviews, sabse naye pehle, cursor pagination ke saath
export const GET = handle(async (req) => {
  const params = new URL(req.url).searchParams;
  const cursor = params.get("cursor");
  const limit = Math.min(Math.max(Number(params.get("limit")) || 6, 1), 24);

  const rows = await prisma.productReview.findMany({
    where: { approved: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      images: true,
      createdAt: true,
      user: { select: { name: true } },
      product: { select: { id: true, name: true } },
    },
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  // Privacy: poora naam nahi, sirf "Rajesh K."
  const items = page.map((r) => {
    const [first, ...rest] = (r.user.name || "Customer").trim().split(/\s+/);
    const displayName = rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
    return { ...r, user: { name: displayName } };
  });

  return NextResponse.json({
    items,
    nextCursor: hasMore ? page[page.length - 1].id : null,
    hasMore,
  });
});