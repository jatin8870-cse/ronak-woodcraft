
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
      side={{
        title: "Join Ronak Wood Craft",
        text: "Create a free account to order furniture and book our carpenters.",
      }}
      points={[
        "Track every order in one place",
        "Book free site visits",
        "Review products you bought",
      ]}
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
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

            formFieldHintText: {
              color: "var(--muted)",
            },
          },
        }}
      />
    </AuthShell>
  );
}
