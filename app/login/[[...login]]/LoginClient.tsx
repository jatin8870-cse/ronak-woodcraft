
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
      side={{
        title: "Welcome back",
        text: "Log in to track your orders, manage site visits and check out faster.",
      }}
      points={[
        "Track every order in one place",
        "Manage and cancel your bookings",
        "Faster checkout with saved details",
      ]}
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
        forceRedirectUrl={next}
        appearance={{
        
variables: {
  colorPrimary: "var(--accent)",
  colorForeground: "var(--ink)",
  colorMutedForeground: "var(--muted)",
  colorBackground: "var(--surface)",
  colorInput: "var(--surface)",
  colorInputForeground: "var(--ink)",
  colorNeutral: "var(--ink)",
  colorBorder: "var(--line)",
  colorDanger: "#dc2626",
  colorPrimaryForeground: "var(--accent-ink)",
  borderRadius: "12px",
  fontFamily: "inherit",
},


          elements: {
            rootBox: {
              width: "100%",
            },

            card: {
              backgroundColor: "var(--surface)",
              boxShadow: "none",
              border: "none",
              width: "100%",
            },

            headerTitle: {
              color: "var(--ink)",
            },

            headerSubtitle: {
              color: "var(--muted)",
            },

            socialButtonsBlockButton: {
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            },

            socialButtonsBlockButtonText: {
              color: "var(--ink)",
            },

            formFieldLabel: {
              color: "var(--ink)",
            },

            formFieldInput: {
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            },

            formFieldInputShowPasswordButton: {
              color: "var(--muted)",
            },

            formFieldAction: {
              color: "var(--accent)",
            },

            formButtonPrimary: {
              backgroundColor: "var(--accent)",
              color: "var(--accent-ink)",
            },

            footer: {
              backgroundColor: "var(--surface)",
            },

            footerActionText: {
              color: "var(--muted)",
            },

            footerActionLink: {
              color: "var(--accent)",
            },

            dividerLine: {
              backgroundColor: "var(--line)",
            },

            dividerText: {
              color: "var(--muted)",
            },

            identityPreviewText: {
              color: "var(--ink)",
            },

            formFieldHintText: {
              color: "var(--muted)",
            },
          },
        }}
      />

      <div className="divider">Store owner?</div>

      <Link href="/admin/login" className="btn ghost block">
        Go to admin login
      </Link>
    </AuthShell>
  );
}
