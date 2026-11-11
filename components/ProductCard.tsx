"use client";
import { Star, ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Product, inr } from "@/lib/data";
import { useStore } from "@/context/StoreContext";
import ProductArt from "./ProductArt";

export default function ProductCard({ p }: { p: Product }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  return (
    <article className="card">
      <div style={{ aspectRatio: "4/3" }}><ProductArt p={p} /></div>
      <div className="body">
        <h3>{p.name}</h3>
        <p className="muted" style={{ fontSize: ".85rem" }}>{p.desc}</p>
        <span className="rating"><Star size={14} fill="currentColor" /> {p.rating}</span>
        <p className="price"><b>{inr(p.price)}</b><s>{inr(p.mrp)}</s> <span className="off">{off}% off</span></p>
        <button className="btn sm" disabled={p.stock === 0} onClick={() => { addToCart(p.id); setAdded(true); setTimeout(() => setAdded(false), 1200); }}>
          {p.stock === 0 ? "Out of stock" : added ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Add to cart</>}
        </button>
      </div>
    </article>
  );
}
