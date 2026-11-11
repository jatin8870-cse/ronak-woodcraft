"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  const { projects, catalogReady } = useStore();
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const list = projects.filter((p) => cat === "All" || p.category === cat);
  if (!catalogReady) return <div className="wrap page">Loading…</div>;
  return (
    <div className="wrap page">
      <h1>Our projects</h1>
      <p className="muted">A look at our finished work — kitchens, wardrobes, furniture and more.</p>
      <div className="filters">{cats.map((c) => <button key={c} className={`pill ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}</div>
      {list.length ? <div className="prod-grid">{list.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
        : <div className="empty"><b>No projects yet</b></div>}
      <div className="cta" style={{ marginTop: 28 }}>
        <h2>Want something like this?</h2>
        <div className="row"><Link href="/bookings?service=custom" className="btn">Book a free visit</Link></div>
      </div>
    </div>
  );
}
