"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import AuthShell from "@/components/auth/AuthShell";
import PasswordInput from "@/components/auth/PasswordInput";

// Admin sign-in lives on its own page, separate from customer login.
export default function AdminLogin() {
  const { isAdmin, authReady, adminLogin } = useStore();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (authReady && isAdmin) router.replace("/admin"); }, [authReady, isAdmin, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    const msg = await adminLogin(pw);
    setBusy(false);
    if (msg) setErr(msg); else router.replace("/admin");
  };

  return (
    <AuthShell badge="Admin access" BadgeIcon={ShieldCheck}
      side={{ title: "Store admin", text: "Manage products, projects, orders and bookings. This area is for authorised staff only." }}
      points={["Add and edit products", "Showcase your finished projects", "Update order and booking status"]}>
      <div><h1>Admin login</h1><p className="muted">Enter the admin password to open the dashboard.</p></div>
      <form className="form" onSubmit={submit}>
        <label className="field">Admin password<PasswordInput required autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {err && <div className="err" role="alert">{err}</div>}
        <button className="btn block" type="submit" disabled={busy}><Lock size={17} /> {busy ? "Checking…" : "Log in as admin"}</button>
        <p className="muted">The password is set in the <code>.env</code> file as <code>ADMIN_PASSWORD</code>.</p>
      </form>
      <div className="divider">Not an admin?</div>
      <Link href="/login" className="btn ghost block">Go to customer login</Link>
    </AuthShell>
  );
}
