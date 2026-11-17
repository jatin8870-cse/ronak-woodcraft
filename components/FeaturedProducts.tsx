"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/data";
import { api } from "@/lib/client";
import ProductCard from "./ProductCard";

type PageResponse = {
  items: Product[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 8; // ek baar me kitne products dikhane hain

export default function FeaturedProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);       // pehli load
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  const fetchPage = useCallback(async (cur: string | null) => {
    if (busy.current) return;
    busy.current = true;
    cur ? setLoadingMore(true) : setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        sort: "pop", // top rated pehle (same as shop page)
      });
      if (cur) params.set("cursor", cur);

      const data = await api<PageResponse>(`/api/products/page?${params}`);

      setItems((prev) => (cur ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Products could not be loaded.");
    } finally {
      busy.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(null);
  }, [fetchPage]);

  if (loading) return <div className="muted">Loading…</div>;

  if (error && items.length === 0) {
    return (
      <div className="empty">
        <p className="muted">{error}</p>
        <button className="btn ghost sm" onClick={() => fetchPage(null)}>Try again</button>
      </div>
    );
  }

  if (!items.length) {
    return <div className="empty"><p className="muted">No products added yet.</p></div>;
  }

  return (
    <>
      <div className="prod-grid">
        {items.map((p) => (
          <div className="prod-grid-item" key={p.id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>

      {error && <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>{error}</p>}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            className="btn ghost"
            onClick={() => fetchPage(cursor)}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}