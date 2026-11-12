import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

export function handle(fn: (req: Request, ctx: any) => Promise<Response>) {
  return async (req: Request, ctx: any) => {
    try { return await fn(req, ctx); }
    catch (e: any) {
      if (e instanceof ZodError) return NextResponse.json({ error: e.issues[0]?.message ?? "Invalid data" }, { status: 400 });
      if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
      if (e?.code === "P2025") return NextResponse.json({ error: "Record not found" }, { status: 404 });
      console.error(e);
      return NextResponse.json({ error: "Server error, please try again shortly" }, { status: 500 });
    }
  };
}

export const normalizePhone = (s: string) => s.replace(/\D/g, "").slice(-10);
export const phoneSchema = z.string().transform(normalizePhone).refine((p) => /^[6-9]\d{9}$/.test(p), "Enter a valid 10-digit mobile number");
export const code = (prefix: string) => prefix + Math.random().toString(36).slice(2, 10).toUpperCase();

export const productSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(120),
  category: z.string().trim().min(1, "Enter a category").max(40),
  price: z.number().int().min(1, "Price must be at least 1"),
  mrp: z.number().int().min(1),
  rating: z.number().min(1).max(5).default(4.5),
  tag: z.string().trim().max(20).nullish(),
  hue: z.number().int().min(0).max(360).default(24),
  desc: z.string().trim().max(1000).default(""),
  images: z.array(z.string().max(2_500_000)).max(12).default([]),
  stock: z.number().int().min(0).default(0),
});

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(140),
  category: z.string().trim().min(1).max(40),
  location: z.string().trim().min(1, "Enter a location").max(80),
  year: z.number().int().min(2000).max(2100),
  description: z.string().trim().min(1, "Enter a description").max(3000),
  images: z.array(z.string().max(2_500_000)).max(12).default([]),
  hue: z.number().int().min(0).max(360).default(24),
  featured: z.boolean().default(true),
});

// Simple in-memory brute-force guard (per server instance; use Redis/Upstash for heavy traffic).
const attempts = new Map<string, { n: number; t: number }>();
export function rateLimit(key: string, max = 5, windowMs = 15 * 60_000) {
  const rec = attempts.get(key);
  const live = rec && Date.now() - rec.t < windowMs ? rec : undefined;
  return {
    ok: !live || live.n < max,
    fail: () => attempts.set(key, { n: (live?.n ?? 0) + 1, t: live?.t ?? Date.now() }),
    reset: () => attempts.delete(key),
  };
}


export const advertisementSchema = z.object({
  title: z.string().trim().min(1, "Enter advertisement title").max(120),
  tag: z.string().trim().max(40).default("Special Offer"),
  description: z.string().trim().min(1, "Enter description").max(500),
  image: z.string().min(1, "Upload a banner image").max(2_500_000),
  buttonText: z.string().trim().min(1).max(40).default("Shop Now"),
  buttonLink: z.string().trim().min(1).max(300).default("/shop"),
  couponCode: z.string().trim().max(40).nullish(),
  discount: z.number().int().min(0).max(100).default(0),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
  startDate: z.string().datetime().nullish(),
  endDate: z.string().datetime().nullish(),
}).refine(
  (data) => !data.startDate || !data.endDate ||
    new Date(data.startDate) <= new Date(data.endDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

