import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSession, hashPassword } from "@/lib/auth";
import { handle, HttpError, phoneSchema, rateLimit } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(120),
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`signup:${ip}`, 10);
  if (!limit.ok) throw new HttpError(429, "Too many attempts. Please try again later.");
  limit.fail(); // every signup attempt counts toward the limit
  const d = schema.parse(await req.json());
  if (await prisma.user.findUnique({ where: { email: d.email } })) throw new HttpError(409, "An account with this email already exists. Please log in.");
  const u = await prisma.user.create({ data: { name: d.name, email: d.email, phone: d.phone, passwordHash: hashPassword(d.password) } });
  await createUserSession(u.id);
  return NextResponse.json({ id: u.id, name: u.name, email: u.email, phone: u.phone }, { status: 201 });
});
