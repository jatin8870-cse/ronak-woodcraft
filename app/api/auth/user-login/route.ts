import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSession, verifyPassword } from "@/lib/auth";
import { handle, HttpError, rateLimit } from "@/lib/api";

export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`user:${ip}`);
  if (!limit.ok) throw new HttpError(429, "Too many attempts. Please try again in 15 minutes.");
  const { email, password } = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email"), password: z.string().min(1, "Enter your password").max(200) }).parse(await req.json());
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u || !verifyPassword(password, u.passwordHash)) { limit.fail(); throw new HttpError(401, "Incorrect email or password"); }
  limit.reset();
  await createUserSession(u.id);
  return NextResponse.json({ id: u.id, name: u.name, email: u.email, phone: u.phone });
});
