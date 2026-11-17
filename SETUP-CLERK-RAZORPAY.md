# Ronak Wood Craft — Clerk + Razorpay integration

This source package contains the Clerk customer-authentication and Razorpay checkout changes.
The original `.env` file and generated `.next` / `node_modules` folders were intentionally not copied.

## 1) Open the project

Open this folder in VS Code. In the VS Code terminal:

```powershell
npm install
```

## 2) Configure Clerk

1. Create an application at https://dashboard.clerk.com/.
2. In Clerk Dashboard, open **API Keys**.
3. Copy the Publishable Key and Secret Key.
4. Open the project's `.env.example`, copy its values into a new file named `.env` in the project root.
5. Fill these variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"
```

Do not put `CLERK_SECRET_KEY` in any `NEXT_PUBLIC_` variable and never commit `.env`.

The existing `/login` and `/signup` pages already render Clerk's `SignIn` and `SignUp` components. The root `middleware.ts` now runs Clerk middleware at the correct Next.js project-root location.

## 3) Configure Razorpay test mode

1. Create/sign in at https://dashboard.razorpay.com/.
2. Switch to **Test Mode**.
3. Go to **Account & Settings → API Keys → Generate Test Key**.
4. Add the values to `.env`:

```env
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

The secret key is server-only. Never add it to a React component or a `NEXT_PUBLIC_` variable.

## 4) Database update

The Prisma schema now has:
- `User.clerkId` (unique) so Clerk accounts map to the existing store customer record.
- nullable `passwordHash` because customer passwords are managed by Clerk.
- Razorpay payment identifiers/status on orders.
- `PaymentAttempt` to store the server-calculated amount and order details until payment is verified.

After setting `DATABASE_URL` in `.env`, run:

```powershell
npx prisma generate
npx prisma db push
```

`db push` updates the existing database schema; it does not intentionally delete your product/order data. Still, take a database backup before running it on production.

## 5) Start and test locally

```powershell
npm run dev
```

Test:
1. Open `/signup`, create an account, then sign out and test `/login`.
2. Add a product to cart.
3. Choose **Cash on delivery** and test the existing COD flow.
4. Choose **Pay online (UPI / Card / Netbanking via Razorpay)**. In Test Mode, use Razorpay's test payment methods/cards from Razorpay documentation.
5. Confirm that the success page appears only after the backend verifies the Razorpay signature and confirms the payment as captured.

## 6) Files changed

| File | Change |
|---|---|
| `middleware.ts` | Clerk middleware moved to the correct project root |
| `app/layout.tsx` | Existing `ClerkProvider` retained |
| `app/login/**` and `app/signup/**` | Existing Clerk UI retained |
| `lib/auth.ts` | Clerk identity maps to the Prisma customer record; admin cookie remains separate |
| `context/StoreContext.tsx` | Restores admin state and stores verified Razorpay order reference |
| `prisma/schema.prisma` | Clerk ID and Razorpay payment fields/models |
| `app/api/payments/razorpay/create-order/route.ts` | Creates Razorpay order using server-side prices |
| `app/api/payments/razorpay/verify/route.ts` | Verifies signature and captured payment, then creates the store order |
| `app/cart/page.tsx` | Adds Razorpay checkout option while keeping COD |
| `app/api/orders/route.ts` | Restricts the regular order endpoint to COD |
| `app/api/auth/signup`, `user-login`, `user-logout` | Removed obsolete custom customer-password endpoints; Clerk is the customer auth provider |

## Important notes

- Clerk handles customer sign-in/sign-up. The store's admin login remains a separate server-side admin session.
- Razorpay integration is in **Test Mode** until you use live API keys. Live payments require Razorpay account activation/KYC and production credentials.
- Razorpay success is not trusted from the browser alone. The backend verifies the HMAC signature and checks the payment with Razorpay before creating an order.
- Do not deploy until `npm run build` passes and the database schema has been updated.
