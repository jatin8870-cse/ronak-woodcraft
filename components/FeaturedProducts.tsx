"use client";
import { useStore } from "@/context/StoreContext";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const { products, catalogReady } = useStore();
  if (!catalogReady) return <div className="muted">Loading…</div>;
  const list = [...products].sort((a, b) => Number(!!b.tag) - Number(!!a.tag) || b.rating - a.rating).slice(0, 8);
  if (!list.length) return <div className="empty"><p className="muted">No products added yet.</p></div>;
  return <div className="prod-grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>;
}
