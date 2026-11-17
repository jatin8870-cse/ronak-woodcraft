
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";

import { CATEGORIES, type Product } from "@/lib/data";
import { useStore } from "@/context/StoreContext";
import { api } from "@/lib/client";
import ProductCard from "@/components/ProductCard";

type ProductPageResponse = {
  items: Product[];
  nextCursor: string | null;
  hasMore: boolean;
};

const PAGE_SIZE = 24;

export default function ShopClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const q = sp.get("q") ?? "";
  const cat = sp.get("cat") ?? "All";

  const [sort, setSort] = useState("pop");

  const [items, setItems] = useState<Product[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadingMoreRef = useRef(false);
  const requestId = useRef(0);

  const { catalogReady } = useStore();

  // Load first page whenever search, category or sorting changes
  useEffect(() => {
    const currentRequest = ++requestId.current;
    let cancelled = false;

    loadingMoreRef.current = false;

    setItems([]);
    setCursor(null);
    setHasMore(true);
    setLoading(true);
    setLoadingMore(false);
    setError("");

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      q,
      cat,
      sort,
    });

    api<ProductPageResponse>(
      `/api/products/page?${params.toString()}`
    )
      .then((data) => {
        if (cancelled) return;

        setItems(data.items);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Products could not be loaded."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [q, cat, sort]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (
      !cursor ||
      !hasMore ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const currentRequest = requestId.current;

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      q,
      cat,
      sort,
      cursor,
    });

    try {
      const data = await api<ProductPageResponse>(
        `/api/products/page?${params.toString()}`
      );

      if (currentRequest !== requestId.current) return;

      setItems((current) => [
        ...current,
        ...data.items,
      ]);

      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load more products."
        );
      }
    } finally {
      if (currentRequest === requestId.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [cursor, hasMore, q, cat, sort]);

  // Update category in URL
  const setCat = (category: string) => {
    const params = new URLSearchParams(sp.toString());

    if (category === "All") {
      params.delete("cat");
    } else {
      params.set("cat", category);
    }

    router.push(
      `/shop${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  // Login ke baad isi Shop URL par wapas bhejo
  const returnTo = `/shop${sp.toString() ? `?${sp.toString()}` : ""}`;

  // useEffect(() => {
  //   if (authReady && !user) {
  //     router.replace(
  //       `/login?next=${encodeURIComponent(returnTo)}`
  //     );
  //   }
  // }, [authReady, user, router, returnTo]);

  if (!catalogReady) {
    return <div className="wrap page">Loading…</div>;
  }

  return (
    <div className="wrap page">
      <h1>Shop</h1>

      <p className="muted">
        {q
          ? `Results for “${q}”`
          : "Solid wood furniture, straight from our workshop."}
      </p>

      <div className="filters">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            className={`pill ${cat === c ? "on" : ""}`}
            onClick={() => setCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="sec-head">
        <span className="muted">
          {loading
            ? "Loading products..."
            : `Showing ${items.length} products${hasMore ? " and more" : ""}`}
        </span>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="pill"
          aria-label="Sort"
        >
          <option value="pop">Top rated</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="prod-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                minHeight: 280,
                borderRadius: 12,
                background: "#eeeeee",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : error && items.length === 0 ? (
        <div className="empty">
          <b>Something went wrong</b>
          <p className="muted">{error}</p>
          <button
            className="pill"
            onClick={() => setSort((current) => current)}
          >
            Try again
          </button>
        </div>
      ) : items.length > 0 ? (
        <>
          <VirtuosoGrid
            useWindowScroll
            data={items}
            endReached={loadMore}
            overscan={300}
            listClassName="prod-grid"
            itemClassName="prod-grid-item"
            itemContent={(_, product) => (
              <ProductCard p={product} />
            )}
          />

          {loadingMore && (
            <p className="muted" style={{ textAlign: "center", padding: 20 }}>
              Loading more products...
            </p>
          )}

          {error && (
            <div className="empty">
              <p className="muted">{error}</p>
              <button className="pill" onClick={loadMore}>
                Try again
              </button>
            </div>
          )}

          {!hasMore && (
            <p className="muted" style={{ textAlign: "center", padding: 20 }}>
              You have reached the end of the products.
            </p>
          )}
        </>
      ) : (
        <div className="empty">
          <b>No products found</b>
          <p className="muted">
            Try a different keyword or send us a custom request.
          </p>
        </div>
      )}
    </div>
  );
}

