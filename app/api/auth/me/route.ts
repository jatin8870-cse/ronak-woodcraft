import { NextResponse } from "next/server";
import { isAdmin, getUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const [admin, user] = await Promise.all([isAdmin().catch(() => false), getUser().catch(() => null)]);
  return NextResponse.json({ admin, user });
}
