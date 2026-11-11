"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogIn, UserPlus, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { inr } from "@/lib/data";

export default function Account() {
  const { profile, setProfile, orders, ready, authReady, user, userLogout, isAdmin } = useStore();
  const [f, setF] = useState(profile);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (ready) setF(profile); }, [ready, profile]);

  return (
    <div className="wrap page">
      <h1>Account</h1>

      {authReady && !user && (
        <div className="profile-card">
          <div className="grow">
            <b style={{ fontSize: "1.15rem" }}>You&apos;re browsing as a guest</b>
            <p className="muted">Log in or create an account to see your orders and bookings on any device.</p>
          </div>
          <div className="row">
            <Link href="/login?next=/account" className="btn"><LogIn size={16} /> Log in</Link>
            <Link href="/signup?next=/account" className="btn ghost"><UserPlus size={16} /> Sign up</Link>
          </div>
        </div>
      )}

      {user && (
        <div className="profile-card">
          <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
          <div className="grow"><b style={{ fontSize: "1.15rem" }}>{user.name}</b><p className="muted">{user.email} · {user.phone}</p></div>
          <button className="btn ghost sm" onClick={() => userLogout()}><LogOut size={16} /> Log out</button>
        </div>
      )}

      {isAdmin && (
        <div className="profile-card" style={{ marginTop: 12 }}>
          <div className="grow"><b>You&apos;re signed in as admin</b><p className="muted">Manage products, projects, orders and bookings.</p></div>
          <Link href="/admin" className="btn sm"><LayoutDashboard size={16} /> Open admin panel</Link>
        </div>
      )}

      <div className="split">
        <form className="form" onSubmit={(e) => { e.preventDefault(); setProfile(f); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
          <h2 style={{ fontSize: "1.2rem" }}>Contact details</h2>
          <label className="field">Name<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="field">Phone<input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <label className="field">Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
          <button className="btn" type="submit">Save</button>
          {saved && <div className="ok">Profile saved.</div>}
          <p className="muted">These details are used to pre-fill checkout and booking forms.</p>
        </form>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="sec-head" style={{ marginBottom: 0 }}><h2 style={{ fontSize: "1.2rem" }}>Recent orders</h2><Link href="/orders" className="more">View all orders →</Link></div>
          {orders.length === 0 && <div className="empty"><p className="muted">No orders yet.</p><Link href="/shop" className="btn sm">Start shopping</Link></div>}
          {orders.slice(0, 3).map((o) => (
            <div className="line" key={o.id}><div className="info"><b>{o.id}</b><span className="muted">{o.date} · {o.items} items · {o.payment}</span><span className="muted">{o.address}</span><span><span className={`status ${o.status === "Cancelled" ? "x" : ""}`}>{o.status}</span></span></div><b>{inr(o.total)}</b></div>
          ))}
          {!user && <p className="muted"><ShieldCheck size={14} style={{ verticalAlign: -2 }} /> Guest orders only appear on the browser they were placed from.</p>}
        </div>
      </div>
    </div>
  );
}
