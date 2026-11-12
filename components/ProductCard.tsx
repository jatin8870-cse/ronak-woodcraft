
"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from "lucide-react";

import { Product, inr } from "@/lib/data";
import { useStore } from "@/context/StoreContext";
import ProductArt from "./ProductArt";

export default function ProductCard({ p }: { p: Product }) {
  const { addToCart, user, authReady } = useStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [added, setAdded] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = p.images?.filter(Boolean) ?? [];
  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);

  const loginUrl = `/login?next=${encodeURIComponent(
    `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
  )}`;

  const handleAddToCart = () => {
    if (!authReady) return;

    if (!user) {
      router.push(loginUrl);
      return;
    }

    addToCart(p.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const changeImage = (direction: number) => {
    setActiveImage((current) =>
      (current + direction + images.length) % images.length
    );
  };

  return (
    <>
      <article className="card">
        <button
          type="button"
          onClick={() => {
            setActiveImage(0);
            setOpen(true);
          }}
          aria-label={`View ${p.name} details`}
          style={{
            display: "block",
            width: "100%",
            padding: 0,
            border: 0,
            cursor: "pointer",
            background: "transparent",
            position: "relative",
          }}
        >
          <div style={{ aspectRatio: "4/3" }}>
            <ProductArt p={p} />
          </div>

          <span
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              background: "white",
              borderRadius: 30,
              padding: "7px 10px",
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#333",
            }}
          >
            <ZoomIn size={15} /> Quick view
          </span>
        </button>

        <div className="body">
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            <h3>{p.name}</h3>
          </button>

          <p className="muted" style={{ fontSize: ".85rem" }}>
            {p.desc}
          </p>

          <span className="rating">
            <Star size={14} fill="currentColor" /> {p.rating}
          </span>

          <p className="price">
            <b>{inr(p.price)}</b>
            <s>{inr(p.mrp)}</s>
            <span className="off">{off}% off</span>
          </p>

          <button
            className="btn sm"
            disabled={p.stock === 0 || !authReady}
            onClick={handleAddToCart}
          >
            {p.stock === 0 ? (
              "Out of stock"
            ) : !authReady ? (
              "Please wait..."
            ) : added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Add to cart
              </>
            )}
          </button>
        </div>
      </article>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              color: "#222",
              width: "100%",
              maxWidth: 900,
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: 16,
              position: "relative",
              padding: 20,
            }}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close product preview"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                border: 0,
                borderRadius: "50%",
                background: "#eee",
                width: 38,
                height: 38,
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 28,
                paddingTop: 20,
              }}
            >
              {/* Product gallery */}
              <div>
                <div
                  style={{
                    height: 350,
                    background: "#f5f2ed",
                    borderRadius: 12,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {images.length > 0 ? (
                    <img
                      src={images[activeImage]}
                      alt={`${p.name} - image ${activeImage + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%" }}>
                      <ProductArt p={p} size={90} />
                    </div>
                  )}

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => changeImage(-1)}
                        aria-label="Previous image"
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: 0,
                          borderRadius: "50%",
                          width: 38,
                          height: 38,
                          cursor: "pointer",
                          background: "white",
                        }}
                      >
                        <ChevronLeft />
                      </button>

                      <button
                        onClick={() => changeImage(1)}
                        aria-label="Next image"
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          border: 0,
                          borderRadius: "50%",
                          width: 38,
                          height: 38,
                          cursor: "pointer",
                          background: "white",
                        }}
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        aria-label={`Show image ${index + 1}`}
                        style={{
                          width: 70,
                          height: 65,
                          padding: 3,
                          borderRadius: 8,
                          border:
                            activeImage === index
                              ? "2px solid #8b5e3c"
                              : "1px solid #ddd",
                          background: "#f5f2ed",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={img}
                          alt={`${p.name} thumbnail ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product details */}
              <div style={{ padding: "12px 0" }}>
                {p.tag && (
                  <span className="tag">{p.tag}</span>
                )}

                <h2 style={{ fontSize: 27, margin: "12px 0" }}>
                  {p.name}
                </h2>

                <span className="rating">
                  <Star size={16} fill="currentColor" /> {p.rating}
                </span>

                <p className="price" style={{ marginTop: 18 }}>
                  <b style={{ fontSize: 25 }}>{inr(p.price)}</b>
                  <s>{inr(p.mrp)}</s>
                  <span className="off">{off}% off</span>
                </p>

                <p className="muted" style={{ lineHeight: 1.8 }}>
                  {p.desc}
                </p>

                <p style={{ marginTop: 18 }}>
                  <b>Category:</b> {p.category}
                </p>

                {p.stock !== undefined && (
                  <p>
                    <b>Stock:</b>{" "}
                    {p.stock > 0 ? `${p.stock} available` : "Out of stock"}
                  </p>
                )}

                <button
                  className="btn block"
                  style={{ marginTop: 24 }}
                  disabled={p.stock === 0 || !authReady}
                  onClick={handleAddToCart}
                >
                  {p.stock === 0
                    ? "Out of stock"
                    : added
                    ? "Added to cart ✓"
                    : "Add to cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

