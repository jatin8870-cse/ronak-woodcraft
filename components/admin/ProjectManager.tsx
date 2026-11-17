"use client";
import { useState } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { Project } from "@/lib/data";
import ImagePicker from "./ImagePicker";

const blank = { title: "", category: "Kitchen", location: "", year: String(new Date().getFullYear()), description: "", images: [] as string[], featured: true };

export default function ProjectManager() {
  const { projects, saveProject, deleteProject } = useStore();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<Project | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));
  const cats = Array.from(new Set(["Kitchen", "Wardrobe", "Furniture", "Doors", "Interior", ...projects.map((p) => p.category)]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      await saveProject({ title: f.title.trim(), category: f.category.trim(), location: f.location.trim(), year: Number(f.year), description: f.description.trim(),
        images: f.images, featured: f.featured, hue: editing?.hue ?? 15 + Math.floor(Math.random() * 25) }, editing?.id);
      setMsg(editing ? "Project updated." : "Project added — it now appears on the Projects page.");
      setF(blank); setEditing(null);
    } catch (err: any) { setMsg(err.message); }
    finally { setBusy(false); setTimeout(() => setMsg(""), 4000); }
  };
  const edit = (p: Project) => {
    setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" });
    setF({ title: p.title, category: p.category, location: p.location, year: String(p.year), description: p.description, images: p.images, featured: p.featured });
  };

  return (
    <div className="split">
      <form className="form" onSubmit={submit}>
        <h2 style={{ fontSize: "1.2rem" }}>{editing ? "Edit project" : "Add new project"}</h2>
        <label className="field">Title<input required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Modular kitchen — Sharma residence" /></label>
        <div className="two">
          <label className="field">Category<input required list="pcats" value={f.category} onChange={(e) => set("category", e.target.value)} /><datalist id="pcats">{cats.map((c) => <option key={c} value={c} />)}</datalist></label>
          <label className="field">Location<input required value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Ambala" /></label>
        </div>
        <label className="field">Year<input type="number" min="2000" max="2100" value={f.year} onChange={(e) => set("year", e.target.value)} /></label>
        <label className="field">Description<textarea required rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} /></label>
        <ImagePicker images={f.images} onChange={(v) => set("images", v)} max={10} />
        <label className="row" style={{ alignItems: "center" }}><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Show on home page</label>
        <div className="row">
          <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Add project"}</button>
          {editing && <button type="button" className="btn ghost" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
        {msg && <div className="ok">{msg}</div>}
      </form>

      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: "1.2rem" }}>All projects ({projects.length})</h2>
        {projects.map((p) => (
          <div className="line" key={p.id}>
            <div className="grain" style={{ ["--h" as any]: p.hue }}>{p.images[0] && <img src={p.images[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}</div>
            <div className="info"><b>{p.title}</b><span className="muted">{p.category} · {p.location} · {p.year}</span></div>
            <button className="icon-btn" onClick={() => { const { id, ...rest } = p; saveProject({ ...rest, featured: !p.featured }, id).catch((x) => alert(x.message)); }} aria-label="Featured toggle" title="Show on home page"><Star size={17} fill={p.featured ? "currentColor" : "none"} color={p.featured ? "var(--accent)" : undefined} /></button>
            <button className="icon-btn" onClick={() => edit(p)} aria-label="Edit"><Pencil size={17} /></button>
            <button className="icon-btn" onClick={() => confirm(`Delete "${p.title}"?`) && deleteProject(p.id).catch((x) => alert(x.message))} aria-label="Delete"><Trash2 size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
