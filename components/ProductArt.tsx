import { Bed, Sofa, UtensilsCrossed, Archive, Table2, Flower2, Armchair } from "lucide-react";
import type { Product } from "@/lib/data";

const icons: Record<string, any> = { Beds: Bed, Sofas: Sofa, Dining: UtensilsCrossed, Storage: Archive, Tables: Table2, Decor: Flower2 };

// Shows the uploaded photo if the admin added one, otherwise a wood-grain placeholder.
export default function ProductArt({ p, size = 44 }: { p: Pick<Product, "category" | "hue" | "tag" | "images" | "name">; size?: number }) {
  const Icon = icons[p.category] ?? Armchair;
  const img = p.images?.[0];
  return (
    <div className="grain" style={{ ["--h" as any]: p.hue, width: "100%", height: "100%" }}>
      {img ? <img src={img} alt={p.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon size={size} strokeWidth={1.4} />}
      {p.tag && <span className="tag">{p.tag}</span>}
    </div>
  );
}
