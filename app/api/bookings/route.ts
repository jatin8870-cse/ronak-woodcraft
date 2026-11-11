import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, phoneSchema, code } from "@/lib/api";
import { optionalUserId } from "@/lib/auth";
import { SERVICES, TIME_SLOTS } from "@/lib/data";
import { publicBooking } from "@/lib/serialize";

const schema = z.object({
  service: z.enum(SERVICES.map((s) => s.id) as [string, ...string[]]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date").refine((d) => d >= new Date(Date.now() - 86_400_000).toISOString().slice(0, 10), "Choose today or a later date"),
  slot: z.enum(TIME_SLOTS as unknown as [string, ...string[]]),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: phoneSchema,
  address: z.string().trim().min(5, "Enter the full address").max(300),
  notes: z.string().trim().max(500).default(""),
});

export const POST = handle(async (req) => {
  const d = schema.parse(await req.json());
  const b = await prisma.booking.create({ data: { ...d, code: code("BK"), userId: await optionalUserId() } });
  return NextResponse.json(publicBooking(b), { status: 201 });
});
