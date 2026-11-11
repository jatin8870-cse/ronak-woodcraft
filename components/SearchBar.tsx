"use client";
import { Search, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);

  const go = (text: string) => router.push(text.trim() ? `/shop?q=${encodeURIComponent(text.trim())}` : "/shop");

  const voice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice search isn't available in this browser."); return; }
    const r = new SR();
    r.lang = "en-IN";
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setQ(t); go(t); };
    r.start();
  };

  return (
    <form className="search" onSubmit={(e) => { e.preventDefault(); go(q); }} role="search">
      <Search size={20} color="var(--muted)" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 'sheesham bed' or 'polish service'…" aria-label="Search" />
      <button type="button" onClick={voice} className={listening ? "live" : ""} aria-label="Voice search"><Mic size={20} /></button>
    </form>
  );
}
