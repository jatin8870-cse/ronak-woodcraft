"use client";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/image";
import { api } from "@/lib/client";

export default function ImagePicker({ images, onChange, max = 6 }: { images: string[]; onChange: (v: string[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files).slice(0, max - images.length)) { try { const dataUrl = await fileToDataUrl(f); out.push((await api<{ url: string }>("/api/admin/upload", { method: "POST", body: JSON.stringify({ dataUrl }) })).url); } catch (e: any) { alert(e.message); } }
    onChange([...images, ...out]); setBusy(false);
    if (ref.current) ref.current.value = "";
  };
  return (
    <div className="field">
      <span>Photos (the first photo becomes the cover)</span>
      <div className="row">
        {images.map((src, n) => (
          <div key={n} style={{ position: "relative", width: 84, height: 84, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button type="button" onClick={() => onChange(images.filter((_, i) => i !== n))} aria-label="Remove photo" style={{ position: "absolute", top: 3, right: 3, width: 22, height: 22, borderRadius: 99, border: 0, background: "rgba(0,0,0,.65)", color: "#fff", display: "grid", placeItems: "center" }}><X size={14} /></button>
          </div>
        ))}
        {images.length < max && (
          <button type="button" className="icon-btn" style={{ width: 84, height: 84 }} onClick={() => ref.current?.click()} disabled={busy} aria-label="Add photo"><ImagePlus size={22} /></button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}
