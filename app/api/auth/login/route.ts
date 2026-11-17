import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPassword, createSession } from "@/lib/auth";
import { handle, HttpError, rateLimit } from "@/lib/api";

// ADMIN login (password only). Customers use /api/auth/user-login.
export const POST = handle(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const limit = rateLimit(`admin:${ip}`);
  if (!limit.ok) throw new HttpError(429, "Too many attempts. Please try again in 15 minutes.");
  const { password } = z.object({ password: z.string().max(200) }).parse(await req.json());
  if (!checkPassword(password)) {
    limit.fail();
    throw new HttpError(401, "Incorrect password");
  }
  limit.reset();
  await createSession();
  return NextResponse.json({ ok: true });
});
