"use client";
import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { inr } from "@/lib/data";
import { api } from "@/lib/client";
import { priceOrder } from "@/lib/pricing";
import ProductArt from "@/components/ProductArt";

export default function CartPage() {
  const { cart, setQty, placeOrder, address, profile, setProfile, products, catalogReady } = useStore();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [msg, setMsg] = useState("");
  const [pay, setPay] = useState("Cash on delivery");
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [addr, setAddr] = useState(address);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const lines = cart.map((l) => ({ ...l, p: products.find((p) => p.id === l.id)! })).filter((l) => l.p);
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const { discount, delivery, total } = priceOrder(subtotal, coupon?.percent ?? 0);

  const apply = async () => {
    try { const c = await api<{ code: string; percent: number }>("/api/coupons/validate", { method: "POST", body: JSON.stringify({ code }) }); setCoupon(c); setMsg(`${c.code} applied — ${c.percent}% off`); }
    catch (e: any) { setCoupon(null); setMsg(e.message); }
  };

  const place = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const o = await placeOrder({ name, phone, address: addr, payment: pay, coupon: coupon?.code });
      setProfile({ ...profile, name, phone });
      setDone(`Order ${o.id} has been placed. Our team will call you shortly.`);
    } catch (err: any) { setMsg(err.message); }
    finally { setBusy(false); }
  };

  if (done) return <div className="wrap page"><div className="empty"><h1>Thank you{name ? `, ${name}` : ""}!</h1><p className="muted">{done}</p><Link href="/account" className="btn">View orders</Link></div></div>;
  if (!catalogReady) return <div className="wrap page">Loading…</div>;
  if (!lines.length) return <div className="wrap page"><h1>Cart</h1><div className="empty"><b>Your cart is empty</b><p className="muted">Add something you like to get started.</p><Link href="/shop" className="btn">Start shopping</Link></div></div>;

  const input = { padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--bg)" };
  return (
    <div className="wrap page">
      <h1>Cart</h1>
      <div className="split">
        <div style={{ display: "grid", gap: 12 }}>
          {lines.map(({ p, qty }) => (
            <div className="line" key={p.id}>
              <div style={{ width: 78, height: 78, borderRadius: 14, overflow: "hidden", flex: "none" }}><ProductArt p={{ ...p, tag: undefined }} size={26} /></div>
              <div className="info"><b>{p.name}</b><span className="muted">{inr(p.price)}</span>
                <div className="qty"><button onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease quantity">−</button><span>{qty}</span><button onClick={() => setQty(p.id, Math.min(qty + 1, p.stock || 1))} aria-label="Increase quantity">+</button></div>
              </div>
              <button className="icon-btn" onClick={() => setQty(p.id, 0)} aria-label="Remove"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        <form className="form" onSubmit={place}>
          <div className="row" style={{ flexWrap: "nowrap" }}>
            <input style={{ ...input, flex: 1, minWidth: 0 }} placeholder="Coupon code (RONAK20)" value={code} onChange={(e) => setCode(e.target.value)} />
            <button type="button" className="btn ghost" onClick={apply}>Apply</button>
          </div>
          <div className="sum">
            <div><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div><span>Discount</span><span>− {inr(discount)}</span></div>}
            <div><span>Delivery</span><span>{delivery ? inr(delivery) : "Free"}</span></div>
            <div className="total"><span>Total</span><span>{inr(total)}</span></div>
          </div>
          <label className="field">Name<input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="field">Mobile number<input required type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" /></label>
          <label className="field">Delivery address<textarea required minLength={5} rows={2} value={addr} onChange={(e) => setAddr(e.target.value)} /></label>
          <label className="field">Payment<select value={pay} onChange={(e) => setPay(e.target.value)}><option>Cash on delivery</option><option>UPI</option><option>Card</option></select></label>
          {msg && <div className="ok">{msg}</div>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Placing order…" : "Place order"}</button>
        </form>
      </div>
    </div>
  );
}
