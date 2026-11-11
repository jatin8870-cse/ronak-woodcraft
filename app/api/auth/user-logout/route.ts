import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/auth";
export async function POST() { destroyUserSession(); return NextResponse.json({ ok: true }); }
