"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, UserRound } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { safeNext } from "@/lib/redirect";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";

export default function LoginClient() {
  const { user, authReady, userLogin } = useStore();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (authReady && user) router.replace(next); }, [authReady, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const msg = await userLogin(email, pw);
    setBusy(false);
    if (msg) setErr(msg); else router.replace(next);
  };

  return (
    <AuthShell badge="Customer login" BadgeIcon={UserRound}
      side={{ title: "Welcome back", text: "Log in to track your orders, manage site visits and check out faster." }}
      points={["Track every order in one place", "Manage and cancel your bookings", "Faster checkout with saved details"]}>
      <div><h1>Log in</h1><p className="muted">Enter your email and password to continue.</p></div>
      <form className="form" onSubmit={submit}>
        <label className="field">Email<input type="email" required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label className="field">Password<PasswordInput required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Your password" /></label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}><LogIn size={17} /> {busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="auth-alt">New here? <Link href={`/signup${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></p>
      <div className="divider">Store owner?</div>
      <Link href="/admin/login" className="btn ghost block">Go to admin login</Link>
    </AuthShell>
  );
}
