"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { SERVICES, TIME_SLOTS } from "@/lib/data";

export default function BookingsClient() {
  const sp = useSearchParams();
  const { bookings, createBooking, cancelBooking, address, profile, setProfile } = useStore();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ service: sp.get("service") ?? "carpenter", name: profile.name, date: today, slot: TIME_SLOTS[0], address, phone: profile.phone, notes: "" });
  const [ok, setOk] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await createBooking(f); setProfile({ ...profile, name: f.name, phone: f.phone }); setOk(true); setTimeout(() => setOk(false), 4000); }
    catch (x: any) { setErr(x.message); }
    finally { setBusy(false); }
  };
  const svcName = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="wrap page">
      <h1>Bookings</h1>
      <p className="muted">Free site visit — our team visits your home to take measurements and give you a quote.</p>
      <div className="split">
        <form className="form" onSubmit={submit}>
          <label className="field">Service
            <select value={f.service} onChange={(e) => set("service", e.target.value)}>{SERVICES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          </label>
          <div className="two">
            <label className="field">Date<input type="date" min={today} required value={f.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label className="field">Time slot<select value={f.slot} onChange={(e) => set("slot", e.target.value)}>{TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}</select></label>
          </div>
          <label className="field">Name<input required minLength={2} value={f.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="field">Phone<input type="tel" required value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98765 43210" /></label>
          <label className="field">Address<textarea required rows={2} value={f.address} onChange={(e) => set("address", e.target.value)} /></label>
          <label className="field">Work details (optional)<textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Size, design or any problem you want us to know about" /></label>
          {err && <div className="ok">{err}</div>}
          <button className="btn" type="submit" disabled={busy}>{busy ? "Booking…" : "Book visit"}</button>
          {ok && <div className="ok">Booking confirmed. We'll call you to confirm the timing.</div>}
        </form>

        <div style={{ display: "grid", gap: 12 }}>
          <h2 style={{ fontSize: "1.2rem" }}>Your bookings</h2>
          {bookings.length === 0 && <div className="empty"><p className="muted">No bookings yet.</p></div>}
          {bookings.map((b) => (
            <div className="line" key={b.id} style={{ alignItems: "flex-start" }}>
              <div className="info">
                <div className="row" style={{ alignItems: "center" }}><b>{svcName(b.service)}</b><span className={`status ${b.status === "Cancelled" ? "x" : ""}`}>{b.status}</span></div>
                <span className="muted">{b.date} · {b.slot}</span>
                <span className="muted">{b.address}</span>
                <span className="muted">ID: {b.id}</span>
              </div>
              {b.status === "Confirmed" && <button className="btn ghost sm" onClick={() => cancelBooking(b.id).catch((x) => alert(x.message))}>Cancel</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
