import { clerkMiddleware } from "@clerk/nextjs/server";

// Koi route yahan block nahi hota: har API route apna login check khud karta hai.
// Ye sirf Clerk ko har request par session padhne deta hai.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Next.js internals aur static files skip karo
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API routes par hamesha chalao
    "/(api|trpc)(.*)",
  ],
};