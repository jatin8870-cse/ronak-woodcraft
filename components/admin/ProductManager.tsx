"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { CATEGORIES, Product, inr } from "@/lib/data";
import ImagePicker from "./ImagePicker";
import ProductArt from "../ProductArt";

const blank = { name: "", category: "Beds", price: "", mrp: "", stock: "10", tag: "", rating: "4.5", desc: "", images: [] as string[] };

export default function ProductManager() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<Product | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));
  const cats = Array.from(new Set([...CATEGORIES, ...products.map((p) => p.category)]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const price = Number(f.price), mrp = Number(f.mrp || f.price);
      await saveProduct({ name: f.name.trim(), category: f.category.trim(), price, mrp: Math.max(mrp, price), rating: Number(f.rating) || 4.5, stock: Number(f.stock),
        tag: f.tag.trim() || undefined, desc: f.desc.trim(), images: f.images, hue: editing?.hue ?? 15 + Math.floor(Math.random() * 25) }, editing?.id);
      setMsg(editing ? "Product updated." : "Product added — it now appears in the shop.");
      setF(blank); setEditing(null);
    } catch (err: any) { setMsg(err.message); }
    finally { setBusy(false); setTimeout(() => setMsg(""), 4000); }
  };
  const edit = (p: Product) => {
    setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" });
    setF({ name: p.name, category: p.category, price: String(p.price), mrp: String(p.mrp), stock: String(p.stock ?? 0), tag: p.tag ?? "", rating: String(p.rating), desc: p.desc, images: p.images ?? [] });
  };

  return (
    <div className="split">
      <form className="form" onSubmit={submit}>
        <h2 style={{ fontSize: "1.2rem" }}>{editing ? "Edit product" : "Add new product"}</h2>
        <label className="field">Name<input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Sheesham King Bed" /></label>
        <div className="two">
          <label className="field">Category<input required list="cats" value={f.category} onChange={(e) => set("category", e.target.value)} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></label>
          <label className="field">Tag (optional)<input value={f.tag} onChange={(e) => set("tag", e.target.value)} placeholder="New / Bestseller" /></label>
        </div>
        <div className="two">
          <label className="field">Selling price (₹)<input required type="number" min="1" value={f.price} onChange={(e) => set("price", e.target.value)} /></label>
          <label className="field">MRP (₹)<input type="number" min="1" value={f.mrp} onChange={(e) => set("mrp", e.target.value)} /></label>
        </div>
        <div className="two">
          <label className="field">Stock<input required type="number" min="0" value={f.stock} onChange={(e) => set("stock", e.target.value)} /></label>
          <label className="field">Rating<input type="number" step="0.1" min="1" max="5" value={f.rating} onChange={(e) => set("rating", e.target.value)} /></label>
        </div>
        <label className="field">Description<textarea rows={3} value={f.desc} onChange={(e) => set("desc", e.target.value)} /></label>
        <ImagePicker images={f.images} onChange={(v) => set("images", v)} />
        <div className="row">
          <button className="btn" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Add product"}</button>
          {editing && <button type="button" className="btn ghost" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}
        </div>
        {msg && <div className="ok">{msg}</div>}
      </form>

      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: "1.2rem" }}>All products ({products.length})</h2>
        {products.map((p) => (
          <div className="line" key={p.id}>
            <div style={{ width: 70, height: 70, borderRadius: 14, overflow: "hidden", flex: "none" }}><ProductArt p={{ ...p, tag: undefined }} size={22} /></div>
            <div className="info"><b>{p.name}</b><span className="muted">{p.category} · {inr(p.price)} · stock {p.stock ?? 0}</span></div>
            <button className="icon-btn" onClick={() => edit(p)} aria-label="Edit"><Pencil size={17} /></button>
            <button className="icon-btn" onClick={() => confirm(`Delete "${p.name}"?`) && deleteProduct(p.id).catch((x) => alert(x.message))} aria-label="Delete"><Trash2 size={17} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
