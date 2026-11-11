"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Tag, Sparkles, ArrowRight, Check, Sofa, Hammer, CookingPot, Paintbrush, Star, BadgeCheck } from "lucide-react";
import { SLIDES } from "@/lib/data";

const ART = [
  { Icon: Sofa, hue: 24, float: "Hand-finished" },
  { Icon: Hammer, hue: 30, float: "Verified carpenters" },
  { Icon: CookingPot, hue: 18, float: "Made to measure" },
  { Icon: Paintbrush, hue: 34, float: "Like-new finish" },
];

export default function Hero() {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, [paused]);

  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <section className="wrap section" style={{ paddingTop: 22 }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="hero" aria-roledescription="carousel">
        {SLIDES.map((s, n) => {
          const { Icon, hue, float } = ART[n % ART.length];
          return (
            <div key={s.title} className={`slide ${n === i ? "on" : ""}`} aria-hidden={n !== i}>
              <div className="slide-copy">
                <span className="chip"><Sparkles size={14} /> {s.tag}</span>
                <h2>{s.title}</h2>
                <p>{s.desc}</p>
                <span className="chip solid">{s.save}</span>
                <div className="row" style={{ alignItems: "center", marginTop: 6 }}>
                  <Link href={s.href} className="btn" tabIndex={n === i ? 0 : -1}>{s.cta} <ArrowRight size={16} /></Link>
                  <button className="chip code" onClick={() => copy(s.code)} tabIndex={n === i ? 0 : -1} aria-label={`Copy coupon ${s.code}`}>
                    {copied && n === i ? <Check size={14} /> : <Tag size={14} />} USE {s.code}
                  </button>
                </div>
                <span className="muted">T&amp;C apply · Verified specialists</span>
              </div>
              <div className="art-wrap" aria-hidden="true">
                <div className="slide-art grain" style={{ ["--h" as any]: hue }}><Icon className="big" size={120} strokeWidth={1.1} /></div>
                <span className="float f1"><Star size={15} fill="currentColor" /> 4.8 average rating</span>
                <span className="float f2"><BadgeCheck size={16} /> {float}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dots">
        {SLIDES.map((_, n) => <button key={n} className={n === i ? "on" : ""} onClick={() => setI(n)} aria-label={`Slide ${n + 1}`} />)}
      </div>
    </section>
  );
}
