"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Hammer, MapPin } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function ProjectDetail() {
  const id = useSearchParams().get("id");
  const { projects, catalogReady: ready } = useStore();
  const p = projects.find((x) => x.id === id);
  const [i, setI] = useState(0);
  if (!ready) return <div className="wrap page">Loading…</div>;
  if (!p) return <div className="wrap page"><div className="empty"><b>Project not found</b><Link href="/projects" className="btn">All projects</Link></div></div>;
  return (
    <div className="wrap page">
      <Link href="/projects" className="muted">← All projects</Link>
      <h1 style={{ marginTop: 8 }}>{p.title}</h1>
      <p className="muted"><MapPin size={14} style={{ verticalAlign: -2 }} /> {p.location} · {p.year} · {p.category}</p>
      <div className="grain" style={{ ["--h" as any]: p.hue, aspectRatio: "16/9", borderRadius: 22, margin: "16px 0" }}>
        {p.images[i] ? <img src={p.images[i]} alt={p.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <Hammer size={56} strokeWidth={1.3} />}
      </div>
      {p.images.length > 1 && (
        <div className="filters">{p.images.map((src, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Photo ${n + 1}`} style={{ border: n === i ? "2px solid var(--accent)" : "1px solid var(--line)", borderRadius: 12, overflow: "hidden", width: 84, height: 64, flex: "none", padding: 0 }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>))}
        </div>
      )}
      <p style={{ maxWidth: "65ch", margin: "12px 0 22px" }}>{p.description}</p>
      <Link href="/bookings?service=custom" className="btn">Want something like this? Book a visit</Link>
    </div>
  );
}
