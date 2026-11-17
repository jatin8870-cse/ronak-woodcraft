"use client";
import { useSearchParams } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import { safeNext } from "@/lib/redirect";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupClient() {
  const next = safeNext(useSearchParams().get("next"));

  return (
    <AuthShell
      badge="Create account"
      BadgeIcon={Sparkles}
      side={{ title: "Join Ronak Wood Craft", text: "Create a free account to order furniture and book our carpenters." }}
      points={["Track every order in one place", "Book free site visits", "Review products you bought"]}
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
        forceRedirectUrl={next}
      />
    </AuthShell>
  );
}