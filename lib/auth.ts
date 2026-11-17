import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Two completely separate sessions: customers and the admin.
const ADMIN_COOKIE = "rwc_admin";
const WEEK = 60 * 60 * 24 * 7;

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("Set JWT_SECRET (at least 16 characters)");
  }
  return new TextEncoder().encode(s);
};

// Async cookie helper
const setCookie = async (
  name: string,
  token: string,
  maxAge: number
) => {
  const cookieStore = await cookies();

  cookieStore.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
};

/* ---------------- Admin (password from .env) ---------------- */

export function checkPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;

  const a = createHash("sha256").update(pw).digest();
  const b = createHash("sha256").update(real).digest();

  return timingSafeEqual(a, b);
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret());

  await setCookie(ADMIN_COOKIE, token, WEEK);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  const cookieStore = await cookies();
  const t = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!t) return false;

  try {
    return (await jwtVerify(t, secret())).payload.role === "admin";
  } catch {
    return false;
  }
}

// At the start of admin routes:
// const denied = await guard();
// if (denied) return denied;

export async function guard() {
  return (await isAdmin())
    ? null
    : NextResponse.json(
        { error: "Admin login required" },
        { status: 401 }
      );
}

/* ---------------- Customers (Clerk) ---------------- */

const userSelect = { id: true, name: true, email: true, phone: true } as const;

// Clerk user -> hamara Prisma user. Pehli baar login par apne aap ban jata hai
// (ya purana user same VERIFIED email se link ho jata hai, orders/reviews safe rehte hain).
export async function getUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId }, select: userSelect });
  if (existing) return existing;

  const cu = await currentUser();
  if (!cu) return null;

  const emailObj = cu.primaryEmailAddress ?? cu.emailAddresses[0];
  const email = emailObj?.emailAddress?.trim().toLowerCase();
  if (!email) return null;

  const verified = emailObj?.verification?.status === "verified";
  const name =
    [cu.firstName, cu.lastName].filter(Boolean).join(" ") ||
    cu.username ||
    email.split("@")[0];
  const phone = cu.primaryPhoneNumber?.phoneNumber ?? "";

  try {
    const old = await prisma.user.findUnique({ where: { email } });
    if (old) {
      // Unverified email se kisi purane account par kabza na ho sake
      if (!verified || (old.clerkId && old.clerkId !== clerkId)) return null;
      return await prisma.user.update({
        where: { id: old.id },
        data: { clerkId, ...(phone && !old.phone ? { phone } : {}) },
        select: userSelect,
      });
    }
    return await prisma.user.create({ data: { clerkId, email, name, phone }, select: userSelect });
  } catch {
    // Do requests ek saath aayi to dusri create fail hogi; ab user mil jayega
    return prisma.user.findUnique({ where: { clerkId }, select: userSelect });
  }
}

// For guest-friendly routes (checkout, booking):
// never throws, returns null for guests.
export async function optionalUserId() {
  try {
    return (await getUser())?.id ?? null;
  } catch {
    return null;
  }
}