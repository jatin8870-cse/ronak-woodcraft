import Link from "next/link";
import { Hammer, MapPin } from "lucide-react";
import type { Project } from "@/lib/data";

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <Link href={`/projects/view?id=${p.id}`} className="card">
      <div style={{ aspectRatio: "4/3" }}>
        <div className="grain" style={{ ["--h" as any]: p.hue, width: "100%", height: "100%" }}>
          {p.images[0] ? <img src={p.images[0]} alt={p.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <Hammer size={40} strokeWidth={1.4} />}
          <span className="tag">{p.category}</span>
        </div>
      </div>
      <div className="body">
        <h3>{p.title}</h3>
        <span className="muted"><MapPin size={13} style={{ verticalAlign: -2 }} /> {p.location} · {p.year}</span>
      </div>
    </Link>
  );
}
