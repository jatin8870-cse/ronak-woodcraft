import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { handle, HttpError } from "@/lib/api";
export const runtime = "nodejs";
export const POST = handle(async (req) => {
  const user = await getUser();
  if (!user) throw new HttpError(401, "Please login first.");
  const { dataUrl, resourceType } = z.object({
    dataUrl: z.string().regex(/^data:(image\/(jpeg|png|webp)|video\/(mp4|webm|quicktime));base64,/).max(28_000_000),
    resourceType: z.enum(["image", "video"])
  }).parse(await req.json());
  const cloud = process.env.CLOUDINARY_CLOUD_NAME, key = process.env.CLOUDINARY_API_KEY, secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) throw new HttpError(503, "Cloudinary is not configured.");
  const timestamp = Math.floor(Date.now()/1000).toString(), folder = "ronak-woodcraft/reviews";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  const form = new FormData();
  form.append("file", dataUrl); form.append("api_key", key); form.append("timestamp", timestamp); form.append("folder", folder); form.append("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`, { method:"POST", body:form });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new HttpError(502, "Media upload failed.");
  return NextResponse.json({ url: result.secure_url });
});
