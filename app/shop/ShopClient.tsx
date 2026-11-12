
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/data";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";

export default function ShopClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const q = (sp.get("q") ?? "").toLowerCase();
  const cat = sp.get("cat") ?? "All";

  const [sort, setSort] = useState("pop");

  const {
    products,
    catalogReady,
    user,
    authReady,
  } = useStore();

  // Login ke baad isi Shop URL par wapas bhejo
  const returnTo = `/shop${sp.toString() ? `?${sp.toString()}` : ""}`;

  useEffect(() => {
    if (authReady && !user) {
      router.replace(
        `/login?next=${encodeURIComponent(returnTo)}`
      );
    }
  }, [authReady, user, router, returnTo]);

  const cats = Array.from(
    new Set([...CATEGORIES, ...products.map((p) => p.category)])
  );

  const list = useMemo(() => {
    let l = products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (!q ||
          `${p.name} ${p.category} ${p.desc}`
            .toLowerCase()
            .includes(q))
    );

    if (sort === "low") {
      l = [...l].sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
      l = [...l].sort((a, b) => b.price - a.price);
    }

    if (sort === "pop") {
      l = [...l].sort((a, b) => b.rating - a.rating);
    }

    return l;
  }, [q, cat, sort, products]);

  const setCat = (c: string) => {
    const p = new URLSearchParams(sp.toString());

    c === "All" ? p.delete("cat") : p.set("cat", c);

    router.push(`/shop?${p.toString()}`);
  };

  // Authentication check
  if (!authReady || !user) {
    return <div className="wrap page">Please wait...</div>;
  }

  if (!catalogReady) {
    return <div className="wrap page">Loading…</div>;
  }

  return (
    <div className="wrap page">
      <h1>Shop</h1>

      <p className="muted">
        {q
          ? `Results for “${sp.get("q")}”`
          : "Solid wood furniture, straight from our workshop."}
      </p>

      <div className="filters">
        {["All", ...cats].map((c) => (
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
        <span className="muted">{list.length} products</span>

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

      {list.length ? (
        <div className="prod-grid">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
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
