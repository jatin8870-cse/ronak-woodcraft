import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHash, timingSafeEqual, randomBytes, scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";

// Two completely separate sessions: customers and the admin.
const ADMIN_COOKIE = "rwc_admin";
const USER_COOKIE = "rwc_user";
const WEEK = 60 * 60 * 24 * 7;

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) throw new Error("Set JWT_SECRET (at least 16 characters)");
  return new TextEncoder().encode(s);
};

const setCookie = (name: string, token: string, maxAge: number) =>
  cookies().set(name, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });

/* ---------------- Admin (password from .env) ---------------- */

export function checkPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = createHash("sha256").update(pw).digest();
  const b = createHash("sha256").update(real).digest();
  return timingSafeEqual(a, b);
}

export async function createSession() {
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  setCookie(ADMIN_COOKIE, token, WEEK);
}
export const destroySession = () => cookies().delete(ADMIN_COOKIE);

export async function isAdmin() {
  const t = cookies().get(ADMIN_COOKIE)?.value;
  if (!t) return false;
  try { return (await jwtVerify(t, secret())).payload.role === "admin"; } catch { return false; }
}
// At the start of admin routes: const denied = await guard(); if (denied) return denied;
export async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: "Admin login required" }, { status: 401 });
}

/* ---------------- Customers (email + password) ---------------- */

export function hashPassword(pw: string) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const a = scryptSync(pw, Buffer.from(salt, "hex"), 64);
  const b = Buffer.from(key, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createUserSession(userId: string) {
  const token = await new SignJWT({ role: "user" }).setSubject(userId).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
  setCookie(USER_COOKIE, token, WEEK);
}
export const destroyUserSession = () => cookies().delete(USER_COOKIE);

export async function getUser() {
  const t = cookies().get(USER_COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    if (payload.role !== "user" || !payload.sub) return null;
    return await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, phone: true } });
  } catch { return null; }
}
// For guest-friendly routes (checkout, booking): never throws, returns null for guests.
export async function optionalUserId() {
  try { return (await getUser())?.id ?? null; } catch { return null; }
}
