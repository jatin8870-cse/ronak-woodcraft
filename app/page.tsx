
"use client";

import { useState } from "react";
import type { ElementType } from "react";

import Link from "next/link";
import Image from "next/image";

import {
  Star,
  ArrowRight,
  Phone,
  MessageCircle,
  Truck,
  ShieldCheck,
  Hammer,
  BadgeIndianRupee,
  BedDouble,
  Sofa,
  Utensils,
  Archive,
} from "lucide-react";

import Hero from "@/components/Hero";
import ServiceIcon from "@/components/ServiceIcon";
import { SERVICES, BRAND } from "@/lib/data";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturedProjects from "@/components/FeaturedProjects";
import FeaturedAdvertisements from "@/components/FeaturedAdvertisements";

const STEPS = [
  {
    t: "Choose a service or product",
    d: "Buy furniture or book a carpenter / custom job.",
  },
  {
    t: "Site visit",
    d: "Our team visits your home to take measurements and discuss the design.",
  },
  {
    t: "Built in our workshop",
    d: "Hand-finished solid wood work, with progress updates along the way.",
  },
  {
    t: "Delivery & fitting",
    d: "Installation and final finishing at your home.",
  },
];

const REVIEWS = [
  {
    n: "Rajesh K.",
    t: "The finish on the sheesham bed is excellent. Delivery and fitting were both on time.",
  },
  {
    n: "Pooja S.",
    t: "The modular kitchen work was really clean. Everything from measuring to installation went smoothly.",
  },
  {
    n: "Amit V.",
    t: "Got my old sofa polished and it looks brand new. The rate was fair too.",
  },
];

const TRUST = [
  { Icon: Truck, t: "Free delivery", d: "On orders above ₹5,000" },
  { Icon: ShieldCheck, t: "1-year warranty", d: "On all furniture" },
  { Icon: Hammer, t: "Verified carpenters", d: "Free site visit" },
  { Icon: BadgeIndianRupee, t: "Pay your way", d: "COD, UPI or card" },
];

const CATS = [
  {
    n: "Bed",
    image: "/images/categories/bed.png",
    h: "30",
    Icon: BedDouble,
  },
  {
    n: "Sofa",
    image: "/images/categories/sofa.png",
    h: "60",
    Icon: Sofa,
  },
  {
    n: "Dining",
    image: "/images/categories/dining.png",
    h: "90",
    Icon: Utensils,
  },
  {
    n: "Wardrobe",
    image: "/images/categories/wardrobe.png",
    h: "120",
    Icon: Archive,
  },
];

function CategoryCard({
  n,
  image,
  h,
  Icon,
}: {
  n: string;
  image: string;
  h: string;
  Icon: ElementType;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/shop?cat=${encodeURIComponent(n)}`}
      className="cat grain"
      style={{ ["--h" as any]: h }}
    >
      <div className="relative w-full h-40 overflow-hidden rounded-xl bg-gray-100">
        {!imageError ? (
          <Image
            src={image}
            alt={`${n} furniture`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
            <Icon size={48} strokeWidth={1.4} />
          </div>
        )}
      </div>

      <span>{n}</span>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      {/* <Hero /> */}

      <FeaturedAdvertisements />

      <section className="wrap" style={{ paddingBottom: 8 }}>
        <div className="trust">
          {TRUST.map(({ Icon, t, d }) => (
            <div key={t}>
              <i>
                <Icon size={20} />
              </i>
              <span>
                <b>{t}</b>
                {d}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <h2>Shop by category</h2>
          <Link href="/shop" className="more">
            View all →
          </Link>
        </div>

        <div className="cats">
          {CATS.map(({ n, image, h, Icon }) => (
            <CategoryCard
              key={n}
              n={n}
              image={image}
              h={h}
              Icon={Icon}
            />
          ))}
        </div>
      </section>

      {/* Available services section */}

      {/* <section className="wrap section" id="services">
        <div className="sec-head">
          <h2>Available services</h2>
          <span className="muted">Free site visit</span>
        </div>

        <div className="svc-grid">
          {SERVICES.map((s) => (
            <Link
              key={s.id}
              href={`/bookings?service=${s.id}`}
              className="svc"
            >
              <i>
                <ServiceIcon name={s.icon} />
              </i>
              {s.name}
            </Link>
          ))}
        </div>
      </section> */}

      <section className="wrap section">
        <div className="sec-head">
          <h2>Popular furniture</h2>
          <Link href="/shop" className="more">
            See all →
          </Link>
        </div>

        <FeaturedProducts />
      </section>

      <section className="wrap section">
        <div className="cta">
          <h2>Can&apos;t find what you need?</h2>

          <p className="muted">
            Send us your design, size or a photo — we&apos;ll give you a custom quote.
          </p>

          <div className="row">
            <Link href="/bookings?service=custom" className="btn">
              Send a custom request <ArrowRight size={16} />
            </Link>

            <a
              className="btn ghost"
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            >
              <Phone size={16} /> Call us
            </a>

            <a
              className="btn ghost"
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Our work section */}

      {/* <section className="wrap section">
        <div className="sec-head">
          <h2>Our work</h2>
          <Link href="/projects" className="more">
            All projects →
          </Link>
        </div>

        <FeaturedProjects />
      </section> */}

      <section className="wrap section">
        <div className="stats-band">
          <div className="stats">
            {[
              ["15+", "years of experience"],
              ["2,500+", "homes delivered"],
              ["4.8", "average rating"],
              ["1 year", "furniture warranty"],
            ].map(([a, b]) => (
              <div className="stat" key={b}>
                <b>{a}</b>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <h2>How it works</h2>
        </div>

        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.t}>
              <div>
                <b>{s.t}</b>
                <p className="muted">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="sec-head">
          <h2>What customers say</h2>
        </div>

        <div className="reviews">
          {REVIEWS.map((r) => (
            <div className="review" key={r.n}>
              <span
                className="rating"
                style={{ color: "var(--accent-2)" }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </span>

              <p>{r.t}</p>

              <div className="by">
                <span className="avatar">{r.n[0]}</span>
                <b>{r.n}</b>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

