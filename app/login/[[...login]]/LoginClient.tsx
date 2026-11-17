"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { UserRound } from "lucide-react";
import { safeNext } from "@/lib/redirect";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginClient() {
  const next = safeNext(useSearchParams().get("next"));

  return (
    <AuthShell
      badge="Customer login"
      BadgeIcon={UserRound}
      side={{ title: "Welcome back", text: "Log in to track your orders, manage site visits and check out faster." }}
      points={["Track every order in one place", "Manage and cancel your bookings", "Faster checkout with saved details"]}
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
        forceRedirectUrl={next}
      />
      <div className="divider">Store owner?</div>
      <Link href="/admin/login" className="btn ghost block">Go to admin login</Link>
    </AuthShell>
  );
}