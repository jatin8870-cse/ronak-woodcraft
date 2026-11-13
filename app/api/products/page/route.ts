
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const q = params.get("q")?.trim() ?? "";
    const cat = params.get("cat") ?? "All";
    const sort = params.get("sort") ?? "pop";
    const cursor = params.get("cursor");
    const limit = Math.min(
      Math.max(Number(params.get("limit")) || 24, 1),
      48
    );

    const where = {
      ...(cat !== "All" ? { category: cat } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
              { desc: { contains: q } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "low"
        ? [{ price: "asc" as const }, { id: "asc" as const }]
        : sort === "high"
        ? [{ price: "desc" as const }, { id: "asc" as const }]
        : [{ rating: "desc" as const }, { id: "asc" as const }];

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const hasMore = products.length > limit;
    const items = hasMore ? products.slice(0, limit) : products;

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
      hasMore,
    });
  } catch (error) {
    console.error("Products pagination error:", error);

    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 }
    );
  }
}
