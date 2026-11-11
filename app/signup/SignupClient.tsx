"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserPlus, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { safeNext } from "@/lib/redirect";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";

export default function SignupClient() {
  const { user, authReady, signup } = useStore();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => { if (authReady && user) router.replace(next); }, [authReady, user, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirm) return setErr("Passwords do not match");
    setBusy(true);
    const msg = await signup({ name: f.name, email: f.email, phone: f.phone, password: f.password });
    setBusy(false);
    if (msg) setErr(msg); else router.replace(next);
  };

  return (
    <AuthShell badge="Create account" BadgeIcon={Sparkles}
      side={{ title: "Join Ronak Wood Craft", text: "A free account keeps your orders and site visits together, on any device." }}
      points={["Free — takes under a minute", "See orders and bookings on any device", "Get updates from our team"]}>
      <div><h1>Sign up</h1><p className="muted">Create your customer account.</p></div>
      <form className="form" onSubmit={submit}>
        <label className="field">Full name<input required minLength={2} autoComplete="name" autoFocus value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
        <div className="two">
          <label className="field">Email<input type="email" required autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></label>
          <label className="field">Mobile number<input type="tel" required inputMode="numeric" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" /></label>
        </div>
        <div className="two">
          <label className="field">Password<PasswordInput required minLength={8} autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 8 characters" /></label>
          <label className="field">Confirm password<PasswordInput required minLength={8} autoComplete="new-password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} /></label>
        </div>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}><UserPlus size={17} /> {busy ? "Creating account…" : "Create account"}</button>
      </form>
      <p className="auth-alt">Already have an account? <Link href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}>Log in</Link></p>
    </AuthShell>
  );
}
