"use client";
import { useEffect, useState } from "react";
import { SERVICES, inr } from "@/lib/data";
import { api } from "@/lib/client";

type AOrder = { id: string; code: string; name: string; phone: string; address: string; payment: string; status: string; total: number; coupon?: string | null; createdAt: string; items: { id: string; name: string; qty: number }[] };
type ABooking = { id: string; code: string; service: string; date: string; slot: string; name: string; phone: string; address: string; notes: string; status: string };

export default function OrdersBookings() {
  const [orders, setOrders] = useState<AOrder[]>([]);
  const [bookings, setBookings] = useState<ABooking[]>([]);
  const [err, setErr] = useState("");
  const svc = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? id;

  useEffect(() => {
    api<AOrder[]>("/api/admin/orders").then(setOrders).catch((e) => setErr(e.message));
    api<ABooking[]>("/api/admin/bookings").then(setBookings).catch((e) => setErr(e.message));
  }, []);

  const setOrder = async (id: string, status: string) => {
    try { const u = await api<AOrder>(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); setOrders((l) => l.map((o) => o.id === id ? u : o)); } catch (e: any) { alert(e.message); }
  };
  const setBooking = async (id: string, status: string) => {
    try { const u = await api<ABooking>(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); setBookings((l) => l.map((b) => b.id === id ? u : b)); } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="split" style={{ gridTemplateColumns: "1fr" }}>
      {err && <div className="ok">{err}</div>}
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Orders ({orders.length})</h2>
        {!orders.length && <div className="empty"><p className="muted">No orders yet.</p></div>}
        {orders.map((o) => (
          <div className="line" key={o.id} style={{ alignItems: "flex-start" }}>
            <div className="info">
              <b>{o.code} · {inr(o.total)}</b>
              <span>{o.name} · <a href={`tel:${o.phone}`}>{o.phone}</a></span>
              <span className="muted">{new Date(o.createdAt).toLocaleString("en-IN")} · {o.payment}{o.coupon ? ` · ${o.coupon}` : ""}</span>
              <span className="muted">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</span>
              <span className="muted">{o.address}</span>
            </div>
            <select className="pill" value={o.status} onChange={(e) => setOrder(o.id, e.target.value)} aria-label="Order status">
              {["Placed", "Packed", "Delivered", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: "1.2rem" }}>Bookings ({bookings.length})</h2>
        {!bookings.length && <div className="empty"><p className="muted">No bookings yet.</p></div>}
        {bookings.map((b) => (
          <div className="line" key={b.id} style={{ alignItems: "flex-start" }}>
            <div className="info">
              <b>{svc(b.service)} · {b.date}</b>
              <span>{b.name} · <a href={`tel:${b.phone}`}>{b.phone}</a></span>
              <span className="muted">{b.slot} · {b.address}</span>
              {b.notes && <span className="muted">“{b.notes}”</span>}
            </div>
            <select className="pill" value={b.status} onChange={(e) => setBooking(b.id, e.target.value)} aria-label="Booking status">
              {["Confirmed", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
