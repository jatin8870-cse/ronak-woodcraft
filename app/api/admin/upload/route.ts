import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { guard } from "@/lib/auth";
import { handle, HttpError } from "@/lib/api";

// Uploads to Cloudinary when keys are set; otherwise the small image is stored in the database as a data URL.
export const POST = handle(async (req) => {
  const denied = await guard(); if (denied) return denied;
  const { dataUrl } = z.object({ dataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/, "Only JPG, PNG or WebP photos").max(2_500_000, "Photo is too large") }).parse(await req.json());

  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return NextResponse.json({ url: dataUrl });

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "ronak-woodcraft";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  const form = new FormData();
  form.append("file", dataUrl); form.append("api_key", key); form.append("timestamp", timestamp); form.append("folder", folder); form.append("signature", signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new HttpError(502, "Photo upload failed");
  return NextResponse.json({ url: json.secure_url });
});
