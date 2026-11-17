# Ronak Wood Craft — Product details, media and verified reviews

## What's added
- Dedicated `/products/[id]` page with product image/video gallery, price, stock and add-to-cart.
- Product cards open the dedicated page instead of the old quick-view popup.
- Admin can add product videos in Product Management (MP4/WebM/MOV, up to 20 MB each).
- Logged-in customers can submit one review per product only when an order for that product exists on their account.
- Customer review photos/videos upload to Cloudinary. Reviews are hidden until admin approval.
- Admin panel has a **Reviews** tab to approve pending reviews.
- Reviews are fetched 8 at a time; review media uses lazy loading / video metadata preload.

## Required Cloudinary environment
The uploaded `.env` in the source project had Cloudinary variable names but their values were empty. Do NOT commit `.env` to Git. Add real values to local `.env` / deployment environment (Vercel Project → Settings → Environment Variables):

```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

Never share `CLOUDINARY_API_SECRET` in chat or source control. Restart local dev server after editing environment variables and redeploy on Vercel.

## Database migration
A new `Product.videos` array and `ProductReview` table were added. Run:

```bash
npx prisma db push
npx prisma generate
```

Then run the app:

```bash
npm run dev
```

Deploying: make sure the production database schema is updated before deploying the app that reads the new fields.

## Where media is stored
- Before this update, the admin upload route used Cloudinary only if all three Cloudinary variables were configured. In the supplied ZIP they were empty, so the fallback returned a compressed base64 data URL; the product's `images` array stored that text in PostgreSQL.
- After this update, product image/video uploads and customer review media uploads require Cloudinary configuration. The actual media file is stored in Cloudinary; PostgreSQL stores only its HTTPS URL and review/product metadata.
- Existing base64 photos are not automatically migrated. They will keep displaying from PostgreSQL until re-uploaded/migrated to Cloudinary. Do not delete old data until you have verified the migrated images.
- Existing project/advertisement uploads that use the same old upload API also now require Cloudinary when uploading new media.

## Notes
- Existing old images in the database are preserved.
- Product videos and review media are limited to 20 MB per file in the UI.
- This package does not contain `.env` to avoid exposing database credentials, JWT secret or admin password.
