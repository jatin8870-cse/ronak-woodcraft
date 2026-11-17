"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";

const AUTOPLAY_MS = 5000;
const SWIPE_MIN_PX = 40;

export default function FeaturedAdvertisements() {
  const { advertisements, catalogReady } = useStore();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const slides = useMemo(
    () => advertisements
      .filter((ad) => ad.active && Boolean(ad.image))
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [advertisements]
  );

  const total = slides.length;
  const goTo = useCallback((index: number) => {
    if (total < 2) return;
    setCurrent((index + total) % total);
  }, [total]);

  // Autoplay: har slide ke liye naya timer. `current` dependency hai, isliye
  // arrow/dot/swipe se slide badalne par timer 5 sec se dobara shuru hota hai.
  useEffect(() => {
    if (paused || total < 2) return;

    const timer = window.setTimeout(() => {
      setCurrent((previous) => (previous + 1) % total);
    }, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [paused, total, current]);

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [current, total]);

  if (!catalogReady || total === 0) return null;

  return (
    <section
      className="wrap section featured-ad-section"
      aria-label="Featured offers"
      aria-roledescription="carousel"
      // Sirf mouse hover par pause. Touch (phone) par pause NAHI hota,
      // warna tap ke baad "hover" atka rehta tha aur slide kabhi nahi badalta tha.
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setPaused(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setPaused(false); }}
      // Sirf keyboard focus par pause (click/tap ke focus par nahi)
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) setPaused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(diff) >= SWIPE_MIN_PX) goTo(diff < 0 ? current + 1 : current - 1);
      }}
    >
      <div className="featured-ad-hero">
        {slides.map((ad, index) => {
          const active = index === current;
          return (
            <div
              key={ad.id}
              className={`featured-ad-slide ${active ? "is-active" : ""}`}
              aria-hidden={!active}
            >
              <Link
                href={ad.buttonLink || "/shop"}
                className="featured-ad-link"
                tabIndex={active ? 0 : -1}
                aria-label={ad.title ? `${ad.title} — explore offer` : "Explore featured offer"}
              >
                <img
                  src={ad.image}
                  alt={ad.title || "Ronak Wood Craft featured offer"}
                  className="featured-ad-image"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </Link>
            </div>
          );
        })}

        {total > 1 && (
          <>
            <button
              type="button"
              className="featured-ad-arrow featured-ad-prev"
              onClick={() => goTo(current - 1)}
              aria-label="Previous banner"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="featured-ad-arrow featured-ad-next"
              onClick={() => goTo(current + 1)}
              aria-label="Next banner"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="featured-ad-dots" aria-label="Choose banner">
          {slides.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              className={index === current ? "is-active" : ""}
              onClick={() => goTo(index)}
              aria-label={`Show banner ${index + 1}`}
              aria-current={index === current ? "true" : undefined}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .featured-ad-section {
          width: 100%;
          padding-top: 22px;
        }

        .featured-ad-hero {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 7;
          overflow: hidden;
          isolation: isolate;
          border-radius: 18px;
          background: var(--surface, #f4eee8);
          box-shadow: var(--shadow);
        }

        .featured-ad-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 650ms ease, visibility 650ms ease;
        }

        .featured-ad-slide.is-active {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          z-index: 1;
        }

        .featured-ad-link {
          display: block;
          width: 100%;
          height: 100%;
          outline-offset: -4px;
        }

        .featured-ad-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          user-select: none;
        }

        .featured-ad-arrow {
          position: absolute;
          z-index: 3;
          top: 50%;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          padding: 0;
          border: 1px solid rgba(255,255,255,.65);
          border-radius: 50%;
          color: #392719;
          background: rgba(255,255,255,.9);
          box-shadow: 0 3px 14px rgba(0,0,0,.16);
          cursor: pointer;
          transform: translateY(-50%);
          transition: background .2s ease, transform .2s ease;
        }

        .featured-ad-arrow:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.06);
        }

        .featured-ad-prev { left: 14px; }
        .featured-ad-next { right: 14px; }

        .featured-ad-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 22px;
          margin-top: 12px;
        }

        .featured-ad-dots button {
          width: 8px;
          height: 8px;
          padding: 0;
          border: 0;
          border-radius: 99px;
          background: var(--line, #d8d0c8);
          cursor: pointer;
          transition: width .25s ease, background .25s ease;
        }

        .featured-ad-dots button.is-active {
          width: 28px;
          background: var(--accent, #a66b3f);
        }

        @media (max-width: 767px) {
          .featured-ad-section { padding-top: 14px; }
          .featured-ad-hero {
            aspect-ratio: 16 / 9;
            border-radius: 12px;
          }
          .featured-ad-image {
            object-fit: contain;
          }
          .featured-ad-arrow {
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,.88);
          }
          .featured-ad-arrow :global(svg) { width: 18px; height: 18px; }
          .featured-ad-prev { left: 7px; }
          .featured-ad-next { right: 7px; }
          .featured-ad-dots { margin-top: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .featured-ad-slide,
          .featured-ad-arrow,
          .featured-ad-dots button { transition: none; }
        }
      `}</style>
    </section>
  );
}
