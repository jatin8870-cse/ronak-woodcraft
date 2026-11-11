# Ronak Wood Craft — Next.js storefront

## Run locally
```bash
npm install
npm run dev     # http://localhost:3000
```

## What's inside
- Home (landing): promo bar, hero carousel, trust strip, categories, services, popular furniture, custom-request CTA, projects, stats, how it works, reviews
- `/shop` (search, category filter, sort) · `/cart` (coupon, checkout) · `/bookings` · `/account`
- **Accounts:** navbar **Account** menu → customer **Log in** (`/login`), **Sign up** (`/signup`) and a separate **Admin login** (`/admin/login`)
- Light/Dark mode, mobile bottom tab bar, WhatsApp button

## Customers vs. admin
| | Customer | Admin |
|---|---|---|
| Sign in at | `/login` (or `/signup` to register) | `/admin/login` |
| Credentials | email + password (stored hashed with scrypt in the `User` table) | `ADMIN_PASSWORD` from `.env` |
| Session cookie | `rwc_user` | `rwc_admin` |
| Lands on | `/account` (profile, orders, bookings) | `/admin` (products, projects, orders & bookings) |

The two sessions are completely separate: a customer cookie can never open the admin panel, and visiting `/admin` without admin access redirects to `/admin/login`.
Checkout and bookings still work for guests. When a customer is logged in, their orders and bookings are linked to the account and show up on any device.

## Things to change
- `lib/data.ts` — phone, WhatsApp, email, address, products, services, coupons
- Product photos: upload them from the admin panel

## Backend setup (Next.js API + PostgreSQL + Prisma)

1. Create a free Postgres database at https://neon.tech (or Supabase) and copy the connection string.
2. Copy `.env.example` to `.env` and fill it in:
   - `DATABASE_URL` — your connection string
   - `ADMIN_PASSWORD` — the admin login password
   - `JWT_SECRET` — 32+ random characters (`openssl rand -hex 32`)
   - Cloudinary keys are optional (empty = photos are saved in the database)
3. Run:
```bash
npm install
npm run db:push     # creates / updates the tables (adds the new User table)
npm run db:seed     # sample products, projects and coupons (RONAK20, CUSTOM15, POLISH10)
npm run dev
```
4. Open `http://localhost:3000/admin/login`, sign in and add your real data.

> Upgrading an existing database? Just run `npm run db:push` once — it adds the `User` table and the optional `userId` columns on orders and bookings. Existing data is untouched.

## Deploy (Vercel)
Push the repo, import the project in Vercel, add the same env variables (`DATABASE_URL`, `ADMIN_PASSWORD`, `JWT_SECRET`) and deploy.

## API
Public: `GET /api/products`, `GET /api/projects`, `POST /api/orders`, `POST /api/bookings`, `POST /api/coupons/validate`,
`POST /api/orders/lookup`, `POST /api/bookings/lookup`, `POST /api/bookings/cancel`
Auth: `POST /api/auth/signup`, `POST /api/auth/user-login`, `POST /api/auth/user-logout` (customers) · `POST /api/auth/login`, `POST /api/auth/logout` (admin) · `GET /api/auth/me`
Admin (admin cookie required): `/api/admin/products`, `/api/admin/projects`, `/api/admin/orders`, `/api/admin/bookings`, `/api/admin/upload`

## Good to know
- Order price, discount and delivery are recalculated on the server, and stock is reduced on the server.
- Login attempts are rate-limited in memory; for heavy traffic use Redis/Upstash.
- There is no password-reset email yet (it would need an email provider).
- Payment is only a COD / UPI / Card option for now; an online payment gateway (Razorpay) isn't connected yet.
