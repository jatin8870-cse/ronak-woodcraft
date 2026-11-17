
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import { guard } from "@/lib/auth";
import { handle, HttpError } from "@/lib/api";

export const runtime = "nodejs";

const uploadSchema = z.object({
  dataUrl: z
    .string()
    .max(28_000_000, "File is too large")
    .regex(
      /^data:(image\/(jpeg|png|webp)|video\/(mp4|webm|quicktime));base64,/,
      "Only JPG, PNG, WebP, MP4, WebM or MOV files are allowed"
    ),
  resourceType: z.enum(["image", "video"]).default("image"),
});

export const POST = handle(async (req) => {
  const denied = await guard();
  if (denied) return denied;

  const { dataUrl, resourceType } = uploadSchema.parse(
    await req.json()
  );

  // Verify that the MIME type matches the selected resource type.
  const mimeType = dataUrl.slice(5, dataUrl.indexOf(";"));

  if (
    (resourceType === "image" && !mimeType.startsWith("image/")) ||
    (resourceType === "video" && !mimeType.startsWith("video/"))
  ) {
    throw new HttpError(400, "File type does not match resource type.");
  }

  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud || !key || !secret) {
    throw new HttpError(
      503,
      "Cloudinary is not configured. Check your .env.local file."
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = `ronak-woodcraft/products`;

  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");

  const form = new FormData();

  form.append("file", dataUrl);
  form.append("api_key", key);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`,
    {
      method: "POST",
      body: form,
    }
  );

  const result = await response.json();

  if (!response.ok || !result.secure_url) {
    console.error(
      "Cloudinary upload failed:",
      result?.error?.message || "Unknown error"
    );

    throw new HttpError(
      502,
      result?.error?.message || "Media upload failed."
    );
  }

  return NextResponse.json({
    url: result.secure_url,
    resourceType,
    publicId: result.public_id,
    format: result.format,
    bytes: result.bytes,
  });
});
