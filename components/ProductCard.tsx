"use client";
import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Check } from "lucide-react";
import { Product, inr } from "@/lib/data";
import { useStore } from "@/context/StoreContext";
import ProductArt from "./ProductArt";

export default function ProductCard({ p }: { p: Product }) {
  const { addToCart, user, authReady } = useStore();
  const [added, setAdded] = useState(false);
  const off = p.mrp > 0 ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  const handleAdd = () => {
    if (!authReady) return;
    if (!user) { window.location.href = `/login?next=${encodeURIComponent(`/products/${p.id}`)}`; return; }
    addToCart(p.id); setAdded(true); window.setTimeout(() => setAdded(false), 1200);
  };
  return <article className="card">
    <Link href={`/products/${p.id}`} className="product-card-image" aria-label={`View ${p.name}`}>
      <ProductArt p={p}/>
      <span className="product-quick-view">View details →</span>
    </Link>
    <div className="body">
      <Link href={`/products/${p.id}`}><h3>{p.name}</h3></Link>
      <p className="muted">{p.desc}</p>
      <span className="rating"><Star size={14} fill="currentColor"/>{p.rating}</span>
      <p className="price"><b>{inr(p.price)}</b> <s>{inr(p.mrp)}</s> <span className="off">{off}% off</span></p>
      <button type="button" className="btn sm product-add-btn" disabled={p.stock === 0 || !authReady} onClick={handleAdd}>
        {p.stock === 0 ? "Out of stock" : !authReady ? "Please wait..." : added ? <><Check size={15}/> Added</> : <><ShoppingBag size={15}/> Add to cart</>}
      </button>
    </div>
  </article>;
}
