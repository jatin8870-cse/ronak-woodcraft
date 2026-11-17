"use client";
import Link from "next/link";
import { useState } from "react";
import { Package, LogIn, ShoppingBag, MapPin, CreditCard, Tag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { inr } from "@/lib/data";

const FILTERS = ["All", "Placed", "Packed", "Delivered", "Cancelled"] as const;
const STEPS = ["Placed", "Packed", "Delivered"];

export default function MyOrders() {
  const { orders, ready, authReady, user } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  if (!ready || !authReady) return <div className="wrap page">Loading…</div>;
  const list = orders.filter((o) => filter === "All" || o.status === filter);

  return (
    <div className="wrap page">
      <h1>My orders</h1>
      <p className="muted">{user ? `All orders placed with ${user.email}` : "Orders placed from this browser"} · {orders.length} total</p>

      {!user && (
        <div className="profile-card">
          <div className="grow"><b>Log in to see every order, on any device</b></div>
          <Link href="/login?next=/orders" className="btn sm"><LogIn size={16} /> Log in</Link>
        </div>
      )}

      <div className="filters">
        {FILTERS.map((f) => <button key={f} className={`pill ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}{f !== "All" && ` (${orders.filter((o) => o.status === f).length})`}</button>)}
      </div>

      {list.length === 0 ? (
        <div className="empty"><Package size={34} color="var(--accent)" /><b>No orders yet</b>
          <Link href="/shop" className="btn"><ShoppingBag size={16} /> Start shopping</Link></div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {list.map((o) => {
            const cancelled = o.status === "Cancelled";
            const at = STEPS.indexOf(o.status);
            return (
              <article className="order" key={o.id}>
                <div className="order-head">
                  <div><b>Order {o.id}</b><span className="muted"> · {o.date}</span></div>
                  <span className={`status ${cancelled ? "x" : ""}`}>{o.status}</span>
                </div>
                {!cancelled && (
                  <ol className="track">{STEPS.map((s, i) => <li key={s} className={i <= at ? "done" : ""}><i />{s}</li>)}</ol>
                )}
                <ul className="order-items">
                  {o.lines.map((l, i) => <li key={i}><span>{l.name} <span className="muted">× {l.qty}</span></span><b>{inr(l.price * l.qty)}</b></li>)}
                </ul>
                <div className="order-foot">
                  <div className="muted">
                    <div><MapPin size={14} style={{ verticalAlign: -2 }} /> {o.address}</div>
                    <div><CreditCard size={14} style={{ verticalAlign: -2 }} /> {o.payment}{o.coupon && <> · <Tag size={13} style={{ verticalAlign: -2 }} /> {o.coupon}</>}</div>
                  </div>
                  <div className="sum" style={{ minWidth: 190 }}>
                    <div><span className="muted">Subtotal</span><span>{inr(o.subtotal)}</span></div>
                    {o.discount > 0 && <div><span className="muted">Discount</span><span>− {inr(o.discount)}</span></div>}
                    <div><span className="muted">Delivery</span><span>{o.delivery ? inr(o.delivery) : "Free"}</span></div>
                    <div className="total"><span>Total</span><span>{inr(o.total)}</span></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}