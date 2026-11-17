"use client";
import { useRef, useState } from "react";
import { Film, X } from "lucide-react";
import { api } from "@/lib/client";

export default function VideoPicker({ videos, onChange, max = 5 }: { videos: string[]; onChange: (v: string[]) => void; max?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy,setBusy] = useState(false);
  const add = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    try {
      const urls = [...videos];
      for (const file of Array.from(files).slice(0, max-videos.length)) {
        if (!["video/mp4","video/webm","video/quicktime"].includes(file.type)) throw new Error("Use MP4, WebM or MOV videos.");
        if (file.size > 20*1024*1024) throw new Error("Each video must be under 20 MB.");
        const dataUrl = await new Promise<string>((resolve,reject) => { const r=new FileReader(); r.onload=()=>resolve(String(r.result)); r.onerror=()=>reject(new Error("Video read failed")); r.readAsDataURL(file); });
        const result = await api<{url:string}>("/api/admin/upload", {method:"POST",body:JSON.stringify({dataUrl,resourceType:"video"})});
        urls.push(result.url);
      }
      onChange(urls);
    } catch(e) { alert(e instanceof Error ? e.message : "Video upload failed."); }
    finally { setBusy(false); if(ref.current) ref.current.value=""; }
  };
  return <div className="field"><span>Product videos (MP4/WebM/MOV, max 20 MB each)</span><div className="row">
    {videos.map((src,i)=><div key={src} style={{position:"relative",width:110}}><video src={src} controls preload="metadata" style={{width:110,height:80,objectFit:"cover"}}/><button type="button" onClick={()=>onChange(videos.filter((_,n)=>n!==i))} aria-label="Remove video"><X size={14}/></button></div>)}
    {videos.length<max && <button type="button" className="icon-btn" onClick={()=>ref.current?.click()} disabled={busy}><Film size={22}/></button>}
  </div><input ref={ref} hidden type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={e=>add(e.target.files)}/>{busy && <small>Uploading video…</small>}</div>;
}
