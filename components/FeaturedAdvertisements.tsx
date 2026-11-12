
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Tag,
  Sparkles,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useStore } from "@/context/StoreContext";

const AUTOPLAY_MS = 5500;

export default function FeaturedAdvertisements() {
  const { advertisements, catalogReady } = useStore();

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch advertisements from StoreContext
  const slides = useMemo(
    () =>
      advertisements
        .filter((ad) => ad.active && ad.image)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [advertisements]
  );

  const total = slides.length;
  const activeAd = slides[current];

  // Slide navigation
  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;

      setCurrent((index + total) % total);
      setCopied(false);
    },
    [total]
  );

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setCurrent((prev) => (prev + 1) % total);
        setCopied(false);
      }
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, total]);

  // Reset current slide if advertisements change
  useEffect(() => {
    if (current >= total && total > 0) {
      setCurrent(0);
    }
  }, [current, total]);

  // Copy coupon code
  const copyCoupon = async (code: string) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!catalogReady || !activeAd) return null;

  return (
    <section
      className="wrap section featured-ad-section"
      aria-label="Featured advertisements"
      aria-roledescription="carousel"
      style={{ paddingTop: 22 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero featured-ad-hero">

        {/* Advertisement Slides */}
        {slides.map((ad, index) => {
          const isActive = index === current;

          return (
            <div
              key={ad.id}
              className={`slide featured-ad-slide ${
                isActive ? "on" : ""
              }`}
              aria-hidden={!isActive}
            >
              {/* LEFT SIDE - TEXT */}
              <div className="slide-copy featured-ad-copy">

                {/* Advertisement Tag */}
                {ad.tag && (
                  <span className="chip">
                    <Sparkles size={14} />
                    {ad.tag}
                  </span>
                )}

                {/* Title */}
                <h2>{ad.title}</h2>

                {/* Description */}
                {ad.description && (
                  <p>{ad.description}</p>
                )}

                {/* Discount */}
                {Number(ad.discount) > 0 && (
                  <span className="chip solid">
                    <Tag size={14} />
                    SAVE {ad.discount}%
                  </span>
                )}

                {/* Buttons */}
                <div className="row featured-ad-actions">

                  <Link
                    href={ad.buttonLink || "/shop"}
                    className="btn"
                    tabIndex={isActive ? 0 : -1}
                  >
                    {ad.buttonText || "SHOP NOW"}
                    <ArrowRight size={16} />
                  </Link>

                  {/* Coupon */}
                  {/* {ad.couponCode && (
                    <button
                      type="button"
                      className="chip code"
                      onClick={() => copyCoupon(ad.couponCode)}
                      tabIndex={isActive ? 0 : -1}
                    >
                      {copied && isActive ? (
                        <Check size={14} />
                      ) : (
                        <Tag size={14} />
                      )}

                      {copied && isActive
                        ? "COPIED"
                        : `USE ${ad.couponCode}`}
                    </button>
                  )} */}

                </div>

                {/* Footer */}
                <span className="muted">
                  T&amp;C apply · Ronak Wood Craft
                </span>
              </div>

              {/* RIGHT SIDE - FULL IMAGE */}
              <div className="ad-image-wrap">
                <img
                  src={ad.image}
                  alt={ad.title || "Ronak Wood Craft advertisement"}
                  className="ad-full-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="ad-arrow ad-prev"
              onClick={() => goTo(current - 1)}
              aria-label="Previous advertisement"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              className="ad-arrow ad-next"
              onClick={() => goTo(current + 1)}
              aria-label="Next advertisement"
            >
              <ChevronRight size={21} />
            </button>
          </>
        )}

      </div>

      {/* Slide Dots */}
      {total > 1 && (
        <div className="dots">
          {slides.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              className={index === current ? "on" : ""}
              onClick={() => goTo(index)}
              aria-label={`Slide ${index + 1}`}
              aria-current={index === current}
            />
          ))}
        </div>
      )}

      {/* Advertisement Layout CSS */}
      <style jsx>{`
        .featured-ad-section {
          width: 100%;
        }

        .featured-ad-hero {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .featured-ad-slide {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          align-items: center;
          gap: 24px;
          width: 100%;
          min-height: 350px;
          padding: 30px 45px;
          box-sizing: border-box;
        }

        .featured-ad-copy {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .featured-ad-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .ad-image-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 300px;
          min-width: 0;
          overflow: hidden;
        }

        .ad-full-image {
          display: block;
          width: 100%;
          height: 100%;
          max-height: 300px;
          object-fit: contain;
          object-position: center;
        }

        .ad-arrow {
          position: absolute;
          z-index: 10;
          top: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: white;
          color: #704326;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
          cursor: pointer;
          transform: translateY(-50%);
          transition: 0.2s ease;
        }

        .ad-arrow:hover {
          background: #9b572c;
          color: white;
        }

        .ad-prev {
          left: 8px;
        }

        .ad-next {
          right: 8px;
        }

        @media (max-width: 767px) {
          .featured-ad-slide {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 16px;
            min-height: auto;
            padding: 24px 20px 38px;
          }

          .featured-ad-copy {
            order: 1;
          }

          .ad-image-wrap {
            order: 2;
            height: 200px;
          }

          .ad-full-image {
            max-height: 200px;
          }

          .ad-arrow {
            display: none;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .featured-ad-slide {
            min-height: 310px;
            gap: 16px;
            padding: 25px 35px;
          }

          .ad-image-wrap {
            height: 260px;
          }

          .ad-full-image {
            max-height: 260px;
          }
        }
      `}</style>
    </section>
  );
}
