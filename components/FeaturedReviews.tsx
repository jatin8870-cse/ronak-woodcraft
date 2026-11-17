"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { api } from "@/lib/client";

type Review = {
  id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
  user: { name: string };
  product: { id: string; name: string };
};

type PageResponse = { items: Review[]; nextCursor: string | null; hasMore: boolean };

const PAGE_SIZE = 6;

export default function FeaturedReviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  const fetchPage = useCallback(async (cur: string | null) => {
    if (busy.current) return;
    busy.current = true;
    cur ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (cur) params.set("cursor", cur);
      const data = await api<PageResponse>(`/api/reviews?${params}`);
      setItems((prev) => (cur ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reviews could not be loaded.");
    } finally {
      busy.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(null); }, [fetchPage]);

  if (loading) return <div className="muted">Loading…</div>;

  if (error && !items.length) {
    return (
      <div className="empty">
        <p className="muted">{error}</p>
        <button className="btn ghost sm" onClick={() => fetchPage(null)}>Try again</button>
      </div>
    );
  }

  if (!items.length) {
    return <div className="empty"><p className="muted">No customer reviews yet.</p></div>;
  }

  return (
    <>
      <div className="reviews">
        {items.map((r) => (
          <div className="review" key={r.id}>
            <span className="rating" style={{ color: "var(--accent-2)" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={16} fill={i < r.rating ? "currentColor" : "none"} />
              ))}
            </span>

            {r.title && <b>{r.title}</b>}
            <p>{r.comment}</p>

            {r.images.length > 0 && (
              <div className="pd-review-media">
                {r.images.slice(0, 2).map((src) => (
                  <img key={src} src={src} loading="lazy" alt="Customer review" />
                ))}
              </div>
            )}

            <div className="by">
              <span className="avatar">{r.user.name[0]}</span>
              <span>
                <b>{r.user.name}</b>
                <br />
                <Link href={`/products/${r.product.id}#reviews`} className="muted">
                  {r.product.name}
                </Link>
              </span>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>{error}</p>}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button className="btn ghost" onClick={() => fetchPage(cursor)} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more reviews"}
          </button>
        </div>
      )}
    </>
  );
}